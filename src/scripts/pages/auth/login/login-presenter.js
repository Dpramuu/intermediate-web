export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        console.error('getLogin: response:', response);
        this.#view.loginFailed(response.message);
        return;
      }

      const accessToken =
        response?.data?.accessToken ?? response?.accessToken ?? response?.token;

      if (!accessToken) {
        console.error('getLogin: no access token in response:', response);
        this.#view.loginFailed(response.message || 'Login failed: no access token');
        return;
      }

      console.debug('getLogin: response:', response);
      console.debug('getLogin: extracted accessToken:', accessToken);

      const putResult = this.#authModel.putAccessToken(accessToken);
      console.debug('getLogin: putAccessToken result:', putResult);
      try {
        console.debug('getLogin: localStorage accessToken:', localStorage.getItem('accessToken'));
      } catch (e) {
        console.debug('getLogin: localStorage read error', e);
      }

      const targetHash = '#/';
      if (location.hash !== targetHash) {
        location.hash = targetHash;
        setTimeout(() => window.dispatchEvent(new Event('hashchange')), 0);
      } else {
        window.dispatchEvent(new Event('hashchange'));
      }

      this.#view.loginSuccessfully(response.message, response.data ?? response);
    } catch (error) {
      console.error('getLogin: error:', error);
      this.#view.loginFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
