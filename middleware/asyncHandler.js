// This is a higher-order function that takes an asynchronous function (fn) as an argument.
// It returns a new function that will be used as an Express route handler.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
// 1. `fn(req, res, next)`: The original async route handler (e.g., registerUser) is executed.
//    Since it's an async function, it will always return a Promise.
//
// 2. `Promise.resolve(...)`: This ensures that what we have is definitely a Promise.
//    If `fn` were to somehow not return a promise, this would wrap its return value in one.
//
// 3. `.catch(next)`: This is the crucial part. If the Promise from `fn` is rejected
//    (meaning an error was thrown inside the async function), the `.catch()` method will be triggered.
//    It then calls `next()` with the error that was caught.
//
// This effectively passes the error along to the next middleware in the Express stack,
// which in this application is the `errorHandler` middleware.

/**
 *
 * Without asyncHandler, you'd have to do this in every controller:
 *
 */
const someController = async (req, res, next) => {
  try {
    const result = await someAsyncOperation();
    res.json(result);
  } catch (error) {
    // Manually pass the error to the error handler
    next(error);
  }
};
