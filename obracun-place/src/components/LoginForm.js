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

    emptyUser = {
        username: '',
        password: ''
    }

    constructor(props) {
        super(props);
        const { authFunc, toastManager } = props;
        this.state = {
            userData: this.emptyUser
        };
        this.toastManager = toastManager;
        this.authFunc = authFunc;
        this.handleChange = this.handleChange.bind(this);
        this.signIn = this.signIn.bind(this);
    }

    /* async login(event) {
        event.preventDefault();
        this.authFunc();
        this.props.history.replace("/home")
    } */

    async signIn() {
        await axios({
            method: 'POST',
            url: 'http://localhost:9088/api/auth/login',
            data: this.state.userData
        })
            .then(response => {
                if (response.status !== 200) {
                    this.setState({ isLoading: false },
                        this.toastManager.add("Undefined error in API: " + response.status, {
                            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                } else {
                    this.authFunc();
                    const token = `Bearer ${response.data.token}`
                    localStorage.setItem('token', token);
                    axios.defaults.headers.common['Authorization'] = token;
                    this.setState({ userData: this.newUserData, isLoading: false },
                        () => this.toastManager.add("Login successfully.", {
                            appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                    this.props.history.push('/home')
                }
            })
            .catch(error => {
                this.setState({ userData: this.newUserData, isLoading: false },
                    () => this.toastManager.add("Error!!", {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    }));
            })
    }

    handleChange = (e) => {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        let userData = { ...this.state.userData };
        userData[name] = value;

        console.log(userData)
        this.setState({ userData: userData });
    }

    render() {
        return (
            <Row className="background">
                <Container>
                    <Card className="body-card">
                        <CardHeader className="header">SIGN IN</CardHeader>
                        <CardBody>
                            <FormGroup row inline>
                                <Label className="form-label" for="name" md={4}><strong>Username</strong></Label>
                                <Col md={5}>
                                    <Input type="text" name="username" id="username" placeholder="Enter username" autoComplete="off" onChange={this.handleChange} />
                                </Col>
                            </FormGroup>
                            <FormGroup row inline>
                                <Label className="form-label" for="password" md={4}><strong>Password</strong></Label>
                                <Col md={5}>
                                    <Input className="input-form" type="password" name="password" id="password" placeholder="Enter password" autoComplete="off" onChange={this.handleChange} />
                                </Col>
                            </FormGroup>
                            <br />
                            <Link style={{ color: 'black' }} to="/sign-up" >Don't have account? Create new one</Link>
                            <Button className="submit-button" onClick={this.signIn}>Submit</Button><br />
                        </CardBody>
                    </Card>
                </Container>
            </Row>
        );
    }
}

export default withToastManager(withCookies(withRouter(LoginForm)));