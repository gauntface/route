class HueLight {
  constructor(id, lightDetails) {
    this._id = id;
    this._state = lightDetails.state;

    delete lightDetails['state'];
    this._metadata = lightDetails;
  }

  get name() {
    return this._metadata.name;
  }

  get state() {
    return Object.assign({}, this._state);
  }

  get supportsColor() {
    return this._state.colormode ? true : false;
  }

  updateState(newState) {
    this._state = newState;
  }
}

module.exports = HueLight;
