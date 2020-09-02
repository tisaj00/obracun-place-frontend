import React from "react";
import { BrowserRouter, Link } from "react-router-dom";
import { Label, FormGroup, Col, Card, CardHeader, Row, Container, Button, Input, Table, CardBody } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import "./RegistrationForm.css";

class RegistrationForm extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      password2: '',
      email: '',
      sex: ''
    }

    this.handleChange = this.handleChange.bind(this);

  };

  handleChange = input => e => {
    this.setState({ [input]: e.target.value }, () => {
      console.log(this.state)
    });
  }

  render() {
    return (
      <Row className="background">
        <Container>
          <form onSubmit={this.register}>
            <Col md={5}>
              <Card className="body-card-registration">
                <CardHeader className="header">SIGN UP</CardHeader>
                <CardBody>
                  <FormGroup row inline>
                    <Label className="form-label" for="name" md={4}><strong>Username</strong></Label>
                    <Col md={5}>
                      <Input type="text" name="username" id="username" placeholder="Enter username" autoComplete="off" onChange={this.handleChange('username')} />
                    </Col>
                  </FormGroup>

                  <FormGroup row inline>
                    <Label className="form-label" for="email" md={4}><strong>Email address</strong></Label>
                    <Col md={5}>
                      <Input type="text" name="email" id="email" placeholder="Enter email" autoComplete="off" onChange={this.handleChange('email')} />
                    </Col>
                  </FormGroup>

                  <FormGroup row inline>
                    <Label className="form-label" for="password" md={4}><strong>Password</strong></Label>
                    <Col md={5}>
                      <Input type="password" name="password" id="password" placeholder="Enter password" autoComplete="off" onChange={this.handleChange('password')} />
                    </Col>
                  </FormGroup>

                  <FormGroup row inline>
                    <Label className="form-label" for="password2" md={4}><strong>Confirm Password</strong></Label>
                    <Col md={5}>
                      <Input type="password" name="password2" id="password2" placeholder="Confirm password" autoComplete="off" onChange={this.handleChange('password2')} />
                    </Col>
                  </FormGroup>

                  <FormGroup row inline>
                    <Label className="form-label" for="sex" md={4}><strong>Sex</strong></Label>
                    <Col md={5}>
                      <Input type="select" defaultValue="Select" name="sex" id="sex" onChange={this.handleChange('sex')} >
                        <option disabled>Select</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                      </Input>
                    </Col>
                  </FormGroup>

                  <Button className="submit-button" type="submit">Submit</Button><br />
                  <Link style={{ color: 'black' }} to={"/"}>Already registered sign in?</Link>
                </CardBody>
              </Card>
            </Col>
          </form>
        </Container>
      </Row>

    );
  }
}

export default withCookies(withRouter(RegistrationForm));