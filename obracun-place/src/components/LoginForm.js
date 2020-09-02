import React from "react";
import { Label, FormGroup, Col, Card, CardHeader, Row, ModalBody, Button, Input, Container, CardBody } from 'reactstrap';
import { BrowserRouter, Link } from "react-router-dom";
import { instanceOf } from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Cookies, withCookies } from 'react-cookie';
import "./LoginForm.css";
import axios from "axios";
import { withToastManager } from 'react-toast-notifications';

class LoginForm extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);
        const { authFunc } = props;
        this.state = {
            item: this.emptyItem,
            username: '',
            password: '',
            clientId: 'aplikacija-client',
            clientSecret: 'aplikacija-secret'
        };

        this.authFunc = authFunc;
        this.login = this.login.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    async login(event) {
        event.preventDefault();
        this.authFunc();
        this.props.history.replace("/home")
    }

    /* async login(e) {
        e.preventDefault();
        const { cookies } = this.props

        let querystring = require('querystring')
        await axios.post(`http://localhost:9088/oauth/token`,
            querystring.stringify({
                grant_type: 'password',
                access_type: 'offline',
                username: this.state.username,
                password: this.state.password
            }),
            {
                headers: {
                    'Authorization': 'Basic ' + window.btoa(this.state.clientId + ':' + this.state.clientSecret)
                }
            })
            .then(response => {
                if (response.status !== 201 && response.status !== 200) {
                    this.setState(
                        () => this.toastManager.add("Error in API: " + response.status, {
                            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                } else {
                    console.log(response.data)
                    cookies.set('access_token', response.data.access_token, { path: '/' });
                    cookies.set('refresh_token', response.data.refresh_token, { path: '/' });
                   this.props.history.push = '/home'
                }
                console.log(response.data)
            })
            .catch(error => {
                this.setState(
                    () => this.toastManager.add("Authentication failed " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    }));
            });
    } */

    handleChange = input => e => {
        this.setState({ [input]: e.target.value }, () => {
        });
    }

    render() {
        return (
            <Row className="background">
                <Container>
                    <form onSubmit={this.login}>
                        <Card className="body-card">
                            <CardHeader className="header">SIGN IN</CardHeader>
                            <CardBody>
                                <FormGroup row inline>
                                    <Label className="form-label" for="name" md={4}><strong>Username</strong></Label>
                                    <Col md={5}>
                                        <Input type="text" name="username" id="username" placeholder="Enter username" autoComplete="off" onChange={this.handleChange('username')} />
                                    </Col>
                                </FormGroup>

                                <FormGroup row inline>
                                    <Label className="form-label" for="password" md={4}><strong>Password</strong></Label>
                                    <Col md={5}>
                                        <Input className="input-form" type="password" name="password" id="password" placeholder="Enter password" autoComplete="off" onChange={this.handleChange('password')} />
                                    </Col>
                                </FormGroup>
                                <br />
                                <Link style={{ color: 'black' }} to="/sign-up" >Don't have account? Create new one</Link>
                                <Button className="submit-button" type="submit">Submit</Button><br />

                            </CardBody>
                        </Card>
                    </form>
                </Container>
            </Row>
        );
    }
}

export default withToastManager(withCookies(withRouter(LoginForm)));