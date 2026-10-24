(function () {
  if (location.pathname.toLowerCase().endsWith('/login.html')) return;

  try {
    const email = localStorage.getItem('bloomcart_session');
    const accounts = JSON.parse(localStorage.getItem('bloomcart_accounts') || '[]');
    const signedIn = Array.isArray(accounts) &&
      accounts.some(account => account && account.email === email);

    if (!signedIn) location.replace('login.html');
  } catch (error) {
    console.error('Could not verify the BloomCart account session.', error);
    location.replace('login.html');
  }
})();
