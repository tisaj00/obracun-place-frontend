import React from 'react';
import { Container } from 'reactstrap';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';

import { withCookies } from 'react-cookie';
import axios from "axios";
import CreateStudent from '../../components/students/CreateStudent.js';
import ViewStudents from '../../components/students/ViewStudents';
import CreatePartner from '../partner/CreatePartner.js';
import ViewPartners from '../partner/ViewPartners.js';
import CreateContract from '../contract/CreateContract.js';
import ViewContracts from '../contract/ViewContracts.js';
import CreateCalculation from '../calculation/CreateCalculation.js';
import ViewCalculations from '../calculation/ViewCalculations.js';
import RegisterForm from '../RegistrationForm.js'
import CreateReceipt from '../receipt/CreateReceipt.js';
import ViewReceipts from '../receipt/ViewReceipts.js';

class Content extends React.Component {
    state = {
        isAuthenticated: false,
        user: undefined
    };

    componentWillReceiveProps(nextProps) {
        let parentState = nextProps.parentState;
        /* this.setState({ user: parentState.user }); */
    }

    constructor(props) {
        super(props);
        const { parentState } = props;
        /* this.state.user = parentState.user; */
        this.parentState = parentState;
    }


    /* async getRole() {
        const username = this.props.match.params.username;
        await axios({
            method: 'POST',
            url: `/api/auth/${username}/admin`
        })
            .then(response => {
                if (response.status !== 200) {

                } else {
                    console.log("ADMIN", response.data.isAdmin)
                    this.setState({
                        isAdmin: response.data.isAdmin
                    });
                }
            })
            .catch(error => {
            })
    } */

    render() {

        return (
            <Container fluid className="content">
                <Switch>
                    <Route path='/sign-up' exact={true} component={RegisterForm} />
                    <Route path='/student/:id' exact={true} component={CreateStudent} />
                    <Route path='/studentView/:id' exact={true} component={ViewStudents} />
                    <Route path='/student' exact={true} component={CreateStudent} />
                    <Route path='/students' exact={true} component={ViewStudents} />

                    <Route path='/partner/:id' component={CreatePartner} />
                    <Route path='/partner' component={CreatePartner} />
                    <Route path='/partners' component={ViewPartners} />

                    <Route path='/contract/:id' component={CreateContract} />
                    <Route path='/contract' component={CreateContract} />
                    <Route path='/contracts' component={ViewContracts} />

                    <Route path='/calculationReview/:id' component={ViewCalculations} />
                    <Route path='/calculation/:id' component={CreateCalculation} />
                    <Route path='/calculation' component={CreateCalculation} />
                    <Route path='/calculations' component={ViewCalculations} />

                    <Route path='/receipt' component={CreateReceipt} />
                    <Route path='/receipts' component={ViewReceipts} />
                </Switch>
            </Container>
        );
    }
}

export default withCookies(withRouter(Content));