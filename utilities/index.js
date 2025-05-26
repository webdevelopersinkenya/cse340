// utilities.js or utilities/index.js

/**
 * Generates a static HTML navigation bar.
 */
const getNav = () => {
  return `
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/inventory">Inventory</a></li>
        <li><a href="/account">Account</a></li>
      </ul>
    </nav>
  `;
};

/**
 * Wraps route handlers with error handling.
 */
const handleErrors = (fn) => {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  getNav,
  handleErrors
};
