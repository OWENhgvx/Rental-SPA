import fs from 'fs';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';

import { InputError, AccessError } from './error.js';
import swaggerDocument from '../swagger.json' assert { type: 'json' };
import {
  getEmailFromAuthorization,
  login,
  logout,
  register,
  save,
  assertOwnsListing,
  assertOwnsBooking,
  addListing,
  getListingDetails,
  getAllListings,
  updateListing,
  removeListing,
  publishListing,
  unpublishListing,
  leaveListingReview,
  makeNewBooking,
  getAllBookings,
  removeBooking,
  acceptBooking,
  declineBooking,
} from './service.js';

// app.use(cors());
const app = express();

// --- 修改 CORS 配置 ---
app.use(cors({
  origin: [
    'https://rental-spa.vercel.app',            // 你的正式域名
    /^https:\/\/rental-spa-.*\.vercel\.app$/,   // 允许所有 Vercel 自动生成的预览域名
    'http://localhost:5005',                    // 允许本地 Vite 开发环境
    'http://localhost:3000'                     // 允许本地其他开发环境
  ],
  credentials: true
}));
// ----------------------

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(morgan(':method :url :status'));

const catchErrors = (fn) => async (req, res) => {
  try {
    console.log(`Authorization header is ${req.header('Authorization')}`);
    if (req.method === 'GET') {
      console.log(`Query params are ${JSON.stringify(req.params)}`);
    } else {
      console.log(`Body params are ${JSON.stringify(req.body)}`);
    }
    await fn(req, res);
    save();
  } catch (err) {
    if (err instanceof InputError) {
      res.status(400).send({ error: err.message });
    } else if (err instanceof AccessError) {
      res.status(403).send({ error: err.message });
    } else {
      console.log(err);
      res.status(500).send({ error: 'A system error ocurred' });
    }
  }
};

/***************************************************************
                       User Auth Functions
***************************************************************/

const authed = (fn) => async (req, res) => {
  const email = getEmailFromAuthorization(req.header('Authorization'));
  await fn(req, res, email);
};

app.post(
  '/user/auth/login',
  catchErrors(async (req, res) => {
    const { email, password } = req.body;
    const token = await login(email, password);
    return res.json({ token });
  }),
);

app.post(
  '/user/auth/register',
  catchErrors(async (req, res) => {
    const { email, password, name } = req.body;
    const token = await register(email, password, name);
    return res.json({ token });
  }),
);

app.post(
  '/user/auth/logout',
  catchErrors(
    authed(async (req, res, email) => {
      await logout(email);
      return res.json({});
    }),
  ),
);

/***************************************************************
                       Listing Functions
***************************************************************/

app.get(
  '/listings',
  catchErrors(async (req, res) => {
    return res.json({ listings: await getAllListings() });
  }),
);

app.get(
  '/listings/:listingid',
  catchErrors(async (req, res) => {
    const { listingid } = req.params;
    return res.status(200).json({ listing: await getListingDetails(listingid) });
  }),
);

app.post(
  '/listings/new',
  catchErrors(
    authed(async (req, res, email) => {
      const { title, address, price, thumbnail, metadata } = req.body;
      return res.status(200).json({
        listingId: await addListing(title, email, address, price, thumbnail, metadata),
      });
    }),
  ),
);

app.put(
  '/listings/:listingid',
  catchErrors(
    authed(async (req, res, email) => {
      const { listingid } = req.params;
      const { title, address, thumbnail, price, metadata } = req.body;
      await assertOwnsListing(email, listingid);
      await updateListing(listingid, title, address, thumbnail, price, metadata);
      return res.status(200).send({});
    }),
  ),
);

app.delete(
  '/listings/:listingid',
  catchErrors(
    authed(async (req, res, email) => {
      const { listingid } = req.params;
      await assertOwnsListing(email, listingid);
      await removeListing(listingid);
      return res.status(200).send({});
    }),
  ),
);

app.put(
  '/listings/publish/:listingid',
  catchErrors(
    authed(async (req, res, email) => {
      const { listingid } = req.params;
      const { availability } = req.body;
      await assertOwnsListing(email, listingid);
      await publishListing(listingid, availability);
      return res.status(200).send({});
    }),
  ),
);

app.put(
  '/listings/unpublish/:listingid',
  catchErrors(
    authed(async (req, res, email) => {
      const { listingid } = req.params;
      await assertOwnsListing(email, listingid);
      await unpublishListing(listingid);
      return res.status(200).send({});
    }),
  ),
);

app.put(
  '/listings/:listingid/review/:bookingid',
  catchErrors(
    authed(async (req, res, email) => {
      const { listingid, bookingid } = req.params;
      const { review } = req.body;
      await leaveListingReview(email, listingid, bookingid, review);
      return res.status(200).send({});
    }),
  ),
);

/***************************************************************
                       Booking Functions
***************************************************************/

app.get(
  '/bookings',
  catchErrors(
    authed(async (req, res, email) => {
      return res.status(200).json({
        bookings: await getAllBookings(),
      });
    }),
  ),
);

app.delete(
  '/bookings/:bookingid',
  catchErrors(
    authed(async (req, res, email) => {
      const { bookingid } = req.params;
      await assertOwnsBooking(email, bookingid);
      await removeBooking(bookingid);
      return res.status(200).send({});
    }),
  ),
);

app.post(
  '/bookings/new/:listingid',
  catchErrors(
    authed(async (req, res, email) => {
      const { listingid } = req.params;
      const { dateRange, totalPrice } = req.body;
      return res.status(200).json({
        bookingId: await makeNewBooking(email, dateRange, totalPrice, listingid),
      });
    }),
  ),
);

app.put(
  '/bookings/accept/:bookingid',
  catchErrors(
    authed(async (req, res, email) => {
      const { bookingid } = req.params;
      await acceptBooking(email, bookingid);
      return res.status(200).json({});
    }),
  ),
);

app.put(
  '/bookings/decline/:bookingid',
  catchErrors(
    authed(async (req, res, email) => {
      const { bookingid } = req.params;
      await declineBooking(email, bookingid);
      return res.status(200).json({});
    }),
  ),
);

/***************************************************************
                       Running Server
***************************************************************/



// app.get('/', (req, res) => res.redirect('/docs'));

// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// const configData = JSON.parse(fs.readFileSync('../frontend/backend.config.json'));
// const port = 'BACKEND_PORT' in configData ? configData.BACKEND_PORT : 5033;

// const server = app.listen(port, () => {
//   console.log(`Backend is now listening on port ${port}!`);
//   console.log(`For API docs, navigate to http://localhost:${port}`);
// });

// export default server;

/***************************************************************
                       Running Server
***************************************************************/

app.get('/', (req, res) => res.redirect('/docs'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * 核心修复：
 * 1. 优先使用环境变量 process.env.PORT (Render 会自动分配，比如 10000)
 * 2. 只有在本地（没有环境变量）时，才去尝试读取配置文件或默认 5005
 */
let port = process.env.PORT; 

if (!port) { // 如果没有环境变量（说明是本地环境）
  try {
    const configPath = '../frontend/backend.config.json';
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath));
      port = configData.BACKEND_PORT;
    }
  } catch (err) {
    // 读取失败也没关系
  }
  port = port || 5005; // 本地保底端口
}

const server = app.listen(port, () => {
  // 部署到 Render 后，这里打印出的应该是类似 10000 的数字
  console.log(`✅ Backend is successfully running on port ${port}`);
});

export default server;