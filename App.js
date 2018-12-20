/**
 * Prime Components app
 * https://github.com/kewp/prime-components
 */

import React, { Component } from 'react';
import { Alert } from 'react-native';
import { authorize, revoke } from 'react-native-app-auth';
import {
  Container, Header, Input, Processing, Keypad, ButtonRow, Login
} from './components';

const config = {
  issuer: 'https://dev-628819.oktapreview.com/oauth2/default',
  clientId: '0oah624du50HDCjFr0h7',
  redirectUrl: 'com.oktapreview.dev-628819:/callback',
  additionalParameters: {},
  scopes: ['openid', 'profile', 'email', 'offline_access']
};

class App extends Component {
  state = {
    number: 123456,
    factors: [],
    processing: false,
    running: false,
    loggedin: false,
    accessToken: ''
  };


authorize = async () => {
  try {
    const authState = await authorize(config);

    this.setState(
      {
        loggedin: true,
        accessToken: authState.accessToken
      }
    );
  } catch (error) {
    Alert.alert('Failed to log in', error.message);
  }
};

revoke = async () => {
  try {
    const { state } = this;
    await revoke(config, {
      tokenToRevoke: state.accessToken,
      sendClientId: true
    });
    this.setState({
      accessToken: '',
      loggedin: false
    });
  } catch (error) {
    Alert.alert('Failed to revoke token', error.message);
  }
};

  getPrimes = (N) => {
    const factors = [];
    let num = N;
    while (num % 2 === 0) {
      factors.push({ key: '2' });
      num /= 2;
    }
    let i; for (i = 3; i <= Math.floor(Math.sqrt(num)); i += 2) {
      while (num % i === 0) {
        factors.push({ key: `${i}` });
        num /= i;
      }
    }
    if (num > 1) { factors.push({ key: `${num}` }); }
    return factors;
  };

  press = (value) => {
    let { number } = this.state;
    if (value === 'Clear') {
      number = Math.floor(number / 10);
      this.setState({ number });
    } else if (value !== 'Go' && value !== 'Back' && number < 1000000) {
      if (number === 0) number = value; else number += value;
      this.setState({ number });
    } else if (value === 'Go') {
      this.setState({ processing: true });
      const factors = this.getPrimes(number);
      this.setState({ running: false });
      this.setState({ factors });
    } else if (value === 'Back') {
      this.setState({ processing: false });
    }
  };

  render() {
    const { state } = this;
    return (
      <Container>
        <Header>Prime Components</Header>
        <Input>{state.number}</Input>
        {state.loggedin ? (
          <Login text="Logout" func={this.revoke}/>
        ) : (
          <Login text="Login" func={this.authorize} />
        )}
        {state.processing ? (
          <Processing running={state.running} factors={state.factors} press={this.press} />
        ) : (
          <Keypad>
            <ButtonRow func={this.press} keys={['1', '2', '3']} />
            <ButtonRow func={this.press} keys={['4', '5', '6']} />
            <ButtonRow func={this.press} keys={['7', '8', '9']} />
            <ButtonRow func={this.press} keys={['0', 'Clear', 'Go']} />
          </Keypad>
        )}
      </Container>
    );
  }
}

export default App;
