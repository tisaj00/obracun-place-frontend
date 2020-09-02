import React, { Component } from 'react';
import './App.css';
import { Spinner, Container } from 'reactstrap';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import LoginForm from './components/LoginForm.js'
import Content from './components/content/Content';
import Navbar from './components/content/Navbar';
import SideBar from './components/content/SideBar';
import { ToastProvider } from 'react-toast-notifications';
import RegistrationForm from './components/RegistrationForm';
import axios from "axios";
import { withCookies, CookiesProvider, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';

class App extends Component {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
      };

    constructor(props) {
        super(props);
        const { cookies } = props;
        this.state = {
            isLoading: true,
            isOpen: true,
            isAuthenticated: false
        };

        this.refresh = this.refresh.bind(this);


        /* // Setup request interceptor
        axios.interceptors.request.use(config => {
            let token = cookies.get('access_token');
            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }
            return config;
        }, error => {
            return Promise.reject(error);
        });

        // Setup response interceptor
        axios.interceptors.response.use(response => {
            return response;
        }, error => {
            if (error.response.status === 401) {
                cookies.remove('access_token', { path: '/' });
                cookies.remove('refresh_token', { path: '/' });
                window.location.href = '/sign-in'
            } else {
                return Promise.reject(error);
            }
        }); */
    }

   /*  getAccessToken() {
        const { cookies } = this.props;
        return cookies.get('access_token');
    }

    getRefreshToken() {
        const { cookies } = this.props;
        return cookies.get('refresh_token');
    }

    setTokens(response) {
        const { cookies } = this.props;
        cookies.set('access_token', response.data.access_token);
        cookies.set('refresh_token', response.data.refresh_token);
    }

    clearTokens() {
        const { cookies } = this.props;
        cookies.remove('access_token');
        cookies.remove('refresh_token');
    }

    toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }
 */



    refresh() {
        this.setState({ isAuthenticated: !this.state.isAuthenticated });
    }

    async componentDidMount() {
        this.setState({ isLoading: false })
    }


    render() {
        if (this.state.isLoading)
            return (
                <div>
                    <div style={{ marginLeft: 'auto', marginRight: 'auto', display: 'table' }}><Spinner type="grow" color="primary" /></div>
                </div>
            )

        return (
            <ToastProvider placement="bottom-right">
                <CookiesProvider>

                    <Router>
                        <div className="App wrapper">
                            {this.state.isAuthenticated && <SideBar toggle={this.toggle} isOpen={this.state.isOpen} />}

                            <Container fluid>
                                {this.state.isAuthenticated && <Navbar toggle={this.toggle} authFunc={this.refresh} />}
                                <Switch>
                                    {!this.state.isAuthenticated && <Route path='/sign-in' exact={true} render={(props) => <LoginForm {...props} authFunc={this.refresh} />} />}
                                    {!this.state.isAuthenticated && <Route path='/sign-up' exact={true} render={(props) => <RegistrationForm {...props} authFunc={this.refresh} />} />}
                                    {this.state.isAuthenticated && <Content toggle={this.toggle} isOpen={this.state.isOpen} />}
                                    {!this.state.isAuthenticated && <Redirect to="/sign-in" />}
                                </Switch>

                            </Container>
                        </div>

                    </Router>
                </CookiesProvider>
            </ToastProvider>
        )
    }
}

export default App;