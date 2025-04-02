// // CORS configuration
// const allowedOrigins = [
//     'http://localhost:3000', // Local development server
//     'http://localhost:5173', // Vite frontend server (local)
//     'http://localhost:5174', // Vite frontend server (local)
// ];
// export const corsOptions = {
//     origin: (origin, callback) => {
//         if (allowedOrigins.includes(origin) || !origin) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// };

//test mode
export const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
