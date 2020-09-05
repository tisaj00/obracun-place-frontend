import React from "react";
import { BrowserRouter, Link } from "react-router-dom";
import { Label, FormGroup, Col, Card, CardHeader, Row, Container, Button, Input, Table, CardBody, Form } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import "./RegistrationForm.css";
import axios from 'axios';
import { withToastManager } from 'react-toast-notifications';

class RegistrationForm extends React.Component {

  newUserData = {
    username: '',
    password: '',
    password2: '',
    email: '',
    sex: '',
    role: 'USER_ROLE'
  }

  constructor(props) {
    super(props);
    const { toastManager } = props;
    this.state = {
      userData: this.newUserData,
      emailValid: false,
      emailValidationMessage: '',
      usernameValid: false,
      usernameValidationMessage: '',
      passwordValid: false,
      passwordValidationMessage: '',
      password2Valid: false,
      password2ValidationMessage: '',
      passwordMatch: false,
      passwordMatchMessage: '',
      sexValid: false,
      sexValidationMessage: ''

    }
    this.toastManager = toastManager;
    this.handleChange = this.handleChange.bind(this);

    this.signUp = this.signUp.bind(this);

  };

  handleChange = (e) => {
    const target = e.target;
    const value = target.value;
    const name = target.name;

    let userData = { ...this.state.userData };
    userData[name] = value;

    console.log(userData)
    this.setState({ userData: userData });
  }

  validEmail(email) {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email === undefined || email.length === 0) {
      return "Email is required";
    } else if (email.length > 0 && !emailRegex.test(email)) {
      return "Invalid email";
    }
    return "";
  }

  validUsername(username) {
    const userRegex = /^(?!(?:[^0-9]*[0-9]){6})(?=.{3,15}$)(?=.*[a-zA-ZÆØÅæøåöÖäÄåÅ])([a-zA-Z0-9ÆØÅæøåöÖäÄåÅ]+)$/;
    if (username === undefined || username.length === 0) {
      return "Username is required";
    } else if (username.length > 0 && username.length < 3) {
      return "Username is too short, minimum 3 characters is required";
    } else if (username.length > 15) {
      return "Username is too long, maximum 15 characters allowed";
    } else if (!userRegex.test(username)) {
      return "Invalid username";
    }
    return "";
  }

  validPassword(password) {
    if (password === undefined || password.length === 0) {
      return "Password is required field";
    } else if (password.length > 0 && password.length < 6) {
      return "Password is too short, minimum 6 characters required";
    }
    return "";
  }

  validSex(sex) {
    if (sex === undefined || sex.length === 0) {
      return "Sex is required field";
    }
    return "";
  }

  matchPassword(password, password2) {
    if (password.length > 5 && password2.length > 5 && password !== password2) {
      return "Password and Confirm Password do not match";
    }
    return "";
  }

  validateRegistrationForm() {
    let { emailValid, emailValidationMessage, usernameValid, usernameValidationMessage, passwordValid, passwordValidationMessage, password2Valid, password2ValidationMessage, passwordMatch, passwordMatchMessage, sexValid, sexValidationMessage } = this.state;

    emailValidationMessage = this.validEmail(this.state.userData.email);
    emailValid = emailValidationMessage.length > 0 ? false : true;

    usernameValidationMessage = this.validUsername(this.state.userData.username);
    usernameValid = usernameValidationMessage.length > 0 ? false : true;

    passwordValidationMessage = this.validPassword(this.state.userData.password);
    passwordValid = passwordValidationMessage.length > 0 ? false : true;

    password2ValidationMessage = this.validPassword(this.state.userData.password2);
    password2Valid = password2ValidationMessage.length > 0 ? false : true;

    passwordMatchMessage = this.matchPassword(this.state.userData.password, this.state.userData.password2);
    passwordMatch = passwordMatchMessage.length > 0 ? false : true;

    sexValidationMessage = this.validSex(this.state.userData.sex);
    sexValid = sexValidationMessage.length > 0 ? false : true;

    this.setState({
      emailValid: emailValid,
      emailValidationMessage: emailValidationMessage,
      usernameValid: usernameValid,
      usernameValidationMessage: usernameValidationMessage,
      passwordValid: passwordValid,
      passwordValidationMessage: passwordValidationMessage,
      password2Valid: password2Valid,
      password2ValidationMessage: password2ValidationMessage,
      passwordMatch: passwordMatch,
      passwordMatchMessage: passwordMatchMessage,
      sexValid: sexValid,
      sexValidationMessage: sexValidationMessage,
      error: undefined
    });
    if (!emailValid || !usernameValid || !passwordValid || !password2Valid || !passwordMatch || !sexValid) {
      return false;
    }
    return true;
  }


  async signUp() {
    if (!this.validateRegistrationForm()) {
      return;
    }

    await axios({
      method: 'POST',
      url: '/api/auth/signup',
      data: this.state.userData
    })
      .then(response => {
        if (response.status !== 200) {
          this.setState({ isLoading: false },
            this.toastManager.add("Undefined error in API: " + response.status, {
              appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
            }));
        } else {
          this.setState({ userData: this.newUserData, isLoading: false },
            () => this.toastManager.add("Registration successfully.", {
              appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
            }));
          this.props.history.push('/sign-in')
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          this.toastManager.add("Error: " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          }));
      })
  }

  render() {

    const { userData, emailValidationMessage, emailValid, usernameValid, usernameValidationMessage, passwordValid, passwordValidationMessage, password2Valid, password2ValidationMessage, passwordMatch, passwordMatchMessage, sexValid, sexValidationMessage } = this.state;

    return (
      <Row className="background">
        <Container>

          <Col md={5}>
            <Card className="body-card-registration">
              <CardHeader className="header">SIGN UP</CardHeader>
              {/* <Form spellCheck="false" onSubmit={this.signUp}> */}
                <CardBody>

                  <FormGroup row inline className={emailValidationMessage.length > 0 ? "form-input-error-displayed" : "form-input-error-not-displayed"}>
                    <Label className="form-label" md={4}><strong>Username</strong></Label>
                    <Col md={5}>
                      <Input type="text" name="username" id="username" placeholder="Enter username" value={userData.username || ''} autoComplete="off" onChange={this.handleChange} />
                      {!usernameValid && <span className="form-input-error">{usernameValidationMessage}</span>}
                    </Col>
                  </FormGroup>

                  <FormGroup row inline className={emailValidationMessage.length > 0 ? "form-input-error-displayed" : "form-input-error-not-displayed"}>
                    <Label className="form-label" for="email" md={4}><strong>Email address</strong></Label>
                    <Col md={5}>
                      <Input type="text" name="email" id="email" placeholder="Enter email" autoComplete="off" value={userData.email || ''} onChange={this.handleChange} />
                      {!emailValid && <span className="form-input-error">{emailValidationMessage}</span>}
                    </Col>
                  </FormGroup>

                  <FormGroup row inline className={passwordValidationMessage.length > 0 || passwordMatchMessage.length > 0 ? "form-input-error-displayed" : "form-input-error-not-displayed"}>
                    <Label className="form-label" for="password" md={4}><strong>Password</strong></Label>
                    <Col md={5}>
                      <Input type="password" name="password" id="password" placeholder="Enter password" autoComplete="off" value={userData.password || ''} onChange={this.handleChange} />
                      {!passwordValid && <span className="form-input-error">{passwordValidationMessage}</span>}
                    </Col>
                  </FormGroup>

                  <FormGroup row inline className={passwordValidationMessage.length > 0 || passwordMatchMessage.length > 0 ? "form-input-error-displayed" : "form-input-error-not-displayed"}>
                    <Label className="form-label" for="password2" md={4}><strong>Confirm Password</strong></Label>
                    <Col md={5}>
                      <Input type="password" name="password2" id="password2" placeholder="Confirm password" autoComplete="off" value={userData.password2 || ''} onChange={this.handleChange} />
                      {!password2Valid && <span className="form-input-error">{password2ValidationMessage}</span>}
                    </Col>
                  </FormGroup>

                  <FormGroup row inline className={sexValidationMessage.length > 0 || passwordMatchMessage.length > 0 ? "form-input-error-displayed" : "form-input-error-not-displayed"}>
                    <Label className="form-label" for="sex" md={4}><strong>Sex</strong></Label>
                    <Col md={5}>
                      <Input type="select" defaultValue="Select" name="sex" id="sex" onChange={this.handleChange} >
                        <option disabled>Select</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                      </Input>
                      {!sexValid && <span className="form-input-error">{sexValidationMessage}</span>}
                    </Col>
                  </FormGroup>

                  {passwordValid && !passwordMatch && <span className="form-input-error">{passwordMatchMessage}</span>}

                  <Button className="submit-button" type="button" onClick={this.signUp}>Submit</Button><br />
                  <Link style={{ color: 'black' }} to={"/"}>Already registered sign in?</Link>
                </CardBody>
             {/*  </Form> */}
            </Card>
          </Col>

        </Container>
      </Row>

    );
  }
}

export default withToastManager(withCookies(withRouter(RegistrationForm)));