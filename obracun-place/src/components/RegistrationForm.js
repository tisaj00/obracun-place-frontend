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
    /* password2: '', */
    email: '',
    sex: '',
    role : 'USER_ROLE'
  }

  constructor(props) {
    super(props);
    const { toastManager } = props;
    this.state = {
      userData: this.newUserData
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



  async signUp() {
    await axios({
      method: 'POST',
      url: 'http://localhost:9088/api/auth/signup',
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

    return (
      <Row className="background">
        <Container>
          {/* <Form onSubmit={this.signUp}> */}
            <Col md={5}>
              <Card className="body-card-registration">
                <CardHeader className="header">SIGN UP</CardHeader>
                <CardBody>
                  <FormGroup row inline>
                    <Label className="form-label" for="name" md={4}><strong>Username</strong></Label>
                    <Col md={5}>
                      <Input type="text" name="username" id="username" placeholder="Enter username" autoComplete="off" onChange={this.handleChange} />
                    </Col>
                  </FormGroup>

                  <FormGroup row inline>
                    <Label className="form-label" for="email" md={4}><strong>Email address</strong></Label>
                    <Col md={5}>
                      <Input type="text" name="email" id="email" placeholder="Enter email" autoComplete="off" onChange={this.handleChange} />
                    </Col>
                  </FormGroup>

                  <FormGroup row inline>
                    <Label className="form-label" for="password" md={4}><strong>Password</strong></Label>
                    <Col md={5}>
                      <Input type="password" name="password" id="password" placeholder="Enter password" autoComplete="off" onChange={this.handleChange} />
                    </Col>
                  </FormGroup>
                  {/* 
                  <FormGroup row inline>
                    <Label className="form-label" for="password2" md={4}><strong>Confirm Password</strong></Label>
                    <Col md={5}>
                      <Input type="password" name="password2" id="password2" placeholder="Confirm password" autoComplete="off" onChange={this.handleChange} />
                    </Col>
                  </FormGroup> */}

                  <FormGroup row inline>
                    <Label className="form-label" for="sex" md={4}><strong>Sex</strong></Label>
                    <Col md={5}>
                      <Input type="select" defaultValue="Select" name="sex" id="sex" onChange={this.handleChange} >
                        <option disabled>Select</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                      </Input>
                    </Col>
                  </FormGroup>

                  <Button className="submit-button" onClick={this.signUp}>Submit</Button><br />
                  <Link style={{ color: 'black' }} to={"/"}>Already registered sign in?</Link>
                </CardBody>
              </Card>
            </Col>
          {/* </Form> */}
        </Container>
      </Row>

    );
  }
}

export default withToastManager(withCookies(withRouter(RegistrationForm)));