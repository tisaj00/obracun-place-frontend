import React, { Component } from 'react';
import { Container, Row, Col, Label, Input, Button, Spinner, Card, CardBody, CardHeader, Table } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withToastManager } from 'react-toast-notifications';
import moment from 'moment';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import Radium, { StyleRoot } from 'radium';
import bounceInRight from 'react-animations/lib/bounce-in-right';
import bounceInLeft from 'react-animations/lib/bounce-in-left';

class CreateCalculation extends Component {

    emptyCalculation = {
        dateCalculation: null,
        hours: '',
        bonusHours: '',
        contract: {
            id: null,
            contractNumber: null,
            description: '',
            startDate: null,
            endDate: null,
            date: null,
            hourlyRate: null,
            student: {
                name: ''
            },
            partner: {
                name: ''
            }
        }
    };

    patchCalculation = {
        hours: null,
        bonusHours: null,
    }


    constructor(props) {
        super(props);
        const { cookies, toastManager } = props;
        this.state = {
            calculation: this.emptyCalculation,
            initialCalculation: this.emptyCalculation,
            patchCalculation: this.patchCalculation,
            xsrfToken: cookies.get('XSRF-TOKEN'),
            isLoading: false,
            contracts: [],
            calculationCard: false
        };
        this.toastManager = toastManager;
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.handleChangeContracts = this.handleChangeContracts.bind(this);
        this.toggleCalculator = this.toggleCalculator.bind(this);
        this.createOrUpdateCalculation = this.createOrUpdateCalculation.bind(this);
    }

    async componentDidMount() {
        this.getAllContracts();
        this.getCalculationById();
    }

    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let initialCalculation = { ...this.state.initialCalculation };
        let calculation = { ...this.state.calculation };
        calculation[name] = value;

        let patchCalculation = { ...this.state.patchCalculation };
        if (calculation[name] !== initialCalculation[name]) {
            patchCalculation[name] = value;
        } else {
            patchCalculation[name] = null;
        }

        this.setState({ calculation: calculation, patchCalculation: patchCalculation });
    }

    handleChangeDate(date) {
        this.setState({
            calculation: { ...this.state.calculation, dateCalculation: date }
        });
    }

    toggleCalculator() {
        this.setState({ calculationCard: !this.state.calculationCard })
    }

    handleChangeContracts(selectedContract) {
        let { calculation } = this.state;
        calculation.contract = selectedContract[0];
        this.setState({ calculation: calculation })
    }

    async getAllContracts() {
        const { xsrfToken } = this.state;

        axios.get('http://localhost:9088/contract/all-contracts', {
            headers: {
                'X-XSRF-TOKEN': xsrfToken,
                'Accept': 'application/json'
            },
            withCredentials: true
        })
            .then(response => {
                if (response.status !== 200) {
                    this.setState({ isLoading: false },
                        this.toastManager.add("Undefined error in API: " + response.status, {
                            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                } else {
                    this.setState({
                        contracts: response.data,
                        isLoading: false
                    })
                    console.log(response.data)
                }
            })
            .catch(error => {
                this.setState({ isLoading: false },
                    this.toastManager.add("getContracts " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    }));
            })
    }

    async getCalculationById() {
        if (this.props.match.params.id !== undefined) {
            this.setState({ isLoading: true });
            await axios.get(`http://localhost:9088/calculation/${this.props.match.params.id}`, {
                headers: {
                    'X-XSRF-TOKEN': this.state.xsrfToken,
                    'Accept': 'application/json'
                },
                withCredentials: true
            })
                .then(response => {
                    console.log(response.data)
                    if (response.status !== 200) {
                        this.toastManager.add("Undefined error in API: " + response.status, {
                            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                        });
                    } else {
                        this.setState({ calculation: response.data.calculation, initialCalculation: response.data.calculation, isLoading: false });
                    }
                })
                .catch(error => {
                    this.setState({ isLoading: false },
                        this.toastManager.add("getCalculation " + error.response.status + " " + error.response.statusText, {
                            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                })
        } else {
            this.setState({ student: this.emptyStudent })
        }
    }


    async createOrUpdateCalculation(event) {
        event.preventDefault();
        const { calculation, xsrfToken, patchCalculation } = this.state;

        await axios({
            method: (calculation.id) ? 'PATCH' : 'POST',
            url: (calculation.id) ? `http://localhost:9088/calculation/patch/${this.props.match.params.id}` : 'http://localhost:9088/calculation/new',
            headers: {
                'X-XSRF-TOKEN': xsrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: (calculation.id) ? patchCalculation : calculation,
            withCredentials: true
        })
            .then(response => {
                if (response.status !== 201 && response.status !== 200) {
                    this.setState({ isLoading: false },
                        () => this.toastManager.add("Undefined error in API: " + response.status, {
                            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                } else {
                    this.setState({ calculation: this.emptyCalculation, isLoading: false },
                        () => this.toastManager.add(response.status === 200 ? "Calculation updated successfully." : "Calculation created successfully.", {
                            appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                }
                this.props.history.push('/calculations')
            })
            .catch(error => {
                this.setState({ isLoading: false },
                    () => this.toastManager.add("Create Calculation " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    }));
            });
    }


    render() {
        const { isLoading, calculation, contracts, initialCalculation } = this.state;

        if (isLoading) {
            return (
                <div className="loading-position">
                    <Spinner className="grow" color="success" />
                </div>
            )
        }
        
        let contractSelected = (calculation.contract !== undefined ? true : false) && calculation.contract.id !== null;
        let buttonDisabled = calculation.dateCalculation && calculation.hours && calculation.bonusHours && contractSelected;
        let hours = (calculation.contract !== undefined && calculation.contract.hourlyRate != null) ? calculation.hours * calculation.contract.hourlyRate : 0;
        let bonusSati = (calculation.contract !== undefined && calculation.contract.hourlyRate != null) ? calculation.contract.hourlyRate * calculation.bonusHours * 1.5 : 0;
        let sat = calculation.hours * 1;
        let bonusSat = calculation.bonusHours * 1;
        let ukupnosati = sat + bonusSat;
        let ukupnoHRK = hours + bonusSati;
        let satnica = (calculation.contract !== undefined && calculation.contract.hourlyRate != null) ? calculation.contract.hourlyRate : 0;
        const styles = {
            bounce: {
                animation: 'x 2s',
                animationName: Radium.keyframes(bounceInRight, 'bounceInRight'),
                animationDuration: '2s'
            },
            bounceLeft: {
                animation: 'x 2s',
                animationName: Radium.keyframes(bounceInLeft, 'bounceInLeft'),
                animationDuration: '2s'
            }
        }

        const cardCalculation =
            <StyleRoot>
                <div className="test" style={styles.bounceLeft}>
                    <Card>
                        <CardHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>
                            Calculation
                    </CardHeader>
                        <CardBody>
                            <Table bordered  >
                                <thead>
                                    <tr>
                                        <th>Vrsta Rada</th>
                                        <th>Broj sati</th>
                                        <th>Cijena</th>
                                        <th>Ukupno(HRK)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Redoviti Rad</th>
                                        <td style={{ textAlign: "right" }}>{calculation.hours}</td>
                                        <td style={{ textAlign: "right" }}>{satnica}</td>
                                        <td style={{ textAlign: "right" }}>{hours.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Rad noću,blagdanima,nedeljom(+50%)</th>
                                        <td style={{ textAlign: "right" }}>{calculation.bonusHours}</td>
                                        <td style={{ textAlign: "right" }}>{(satnica * 1.5).toFixed(2)}</td>
                                        <td style={{ textAlign: "right" }}>{bonusSati.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Ukupno</th>
                                        <td style={{ textAlign: "right" }}>{ukupnosati}</td>
                                        <td></td>
                                        <td style={{ textAlign: "right" }}>{ukupnoHRK.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                            {this.props.match.params.id ? <Button disabled={JSON.stringify(calculation) === JSON.stringify(initialCalculation)} style={{ float: 'right' }} type="button" color="success" onClick={this.createOrUpdateCalculation}><FontAwesomeIcon icon={faCheckSquare} /></Button> : <Button disabled={!buttonDisabled} style={{ float: 'right' }} type="button" color="success" onClick={this.createOrUpdateCalculation}><FontAwesomeIcon icon={faCheckSquare} /></Button>}
                        </CardBody>
                    </Card>
                </div>
            </StyleRoot>

        const cardContract = (calculation.contract !== undefined && calculation.contract.contractNumber != null) ? <Col md={6}>
            <StyleRoot>
                <div className="test" style={styles.bounce}>
                    <Card>
                        <CardHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>
                            Student info
                    </CardHeader>
                        <CardBody>
                            <Row>
                                <Label className="form-label" md={2}><strong>First Name:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={calculation.contract.student.name} />
                                </Col>

                                <Label className="form-label" md={3}><strong>Last Name:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={calculation.contract.student.lastName} />
                                </Col>
                            </Row>
                            <br></br>
                            <Row>
                                <Label className="form-label" md={2}><strong>Oib:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={calculation.contract.student.oib} />
                                </Col>
                                <Label className="form-label" md={3}><strong>Jmbag:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={calculation.contract.student.jmbag} />
                                </Col>
                            </Row>
                            <br></br>
                            <Row>
                                <Label className="form-label" md={2}><strong>Email:</strong></Label>
                                <Col md={4}>
                                    <Input type="text" disabled={true} value={calculation.contract.student.email} />
                                </Col>
                                <Label className="form-label" md={2}><strong>Date od Birth:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={moment(calculation.contract.student.dateBirth).format('DD.MM.YYYY.')} />
                                </Col>
                            </Row>
                            <br></br>
                            <Row>
                                <Label className="form-label" md={2}><strong>Sex:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={calculation.contract.student.sex} />
                                </Col>
                                <Label className="form-label" md={3}><strong>City:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={calculation.contract.student.city.name} />
                                </Col>
                            </Row>
                            <br></br>
                            <Row>
                                <Label className="form-label" md={2}><strong>Iban:</strong></Label>
                                <Col md={4}>
                                    <Input type="text" disabled={true} value={calculation.contract.student.iban} />
                                </Col>
                                <Label className="form-label" md={2}><strong>Faculty:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={calculation.contract.student.faculty.tag} />
                                </Col>
                            </Row>
                        </CardBody>
                        <CardHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>
                            Partner info
                </CardHeader>
                        <CardBody>
                            <Row>
                                <Label className="form-label" md={2}><strong>Name:</strong></Label>
                                <Col md={4}>
                                    <Input type="text" disabled={true} value={calculation.contract.partner.name} />
                                </Col>
                                <Label className="form-label" md={2}><strong>Oib:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={calculation.contract.partner.oib} />
                                </Col>
                            </Row>
                            <br></br>
                            <Row>
                                <Label className="form-label" md={2}><strong>Description:</strong></Label>
                                <Col md={4}>
                                    <Input type="text" disabled={true} value={calculation.contract.partner.description} />
                                </Col>
                                <Label className="form-label" md={2}><strong>City:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={calculation.contract.partner.city.name} />
                                </Col>
                            </Row>
                            <br></br>
                            <Row>
                                <Label className="form-label" md={2}><strong>Location:</strong></Label>
                                <Col md={4}>
                                    <Input type="text" disabled={true} value={calculation.contract.partner.location} />
                                </Col>
                            </Row>
                        </CardBody>
                        <CardHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>
                            Contract info
                </CardHeader>
                        <CardBody>
                            <Row>
                                <Label className="form-label" md={2}><strong>Description:</strong></Label>
                                <Col md={4}>
                                    <Input type="text" disabled={true} value={calculation.contract.description.name} />
                                </Col>
                                <Label className="form-label" md={2}><strong>Hourly rate:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={calculation.contract.hourlyRate} />
                                </Col>
                            </Row>
                            <br></br>
                            <Row>
                                <Label className="form-label" md={2}><strong>Start date:</strong></Label>
                                <Col md={4}>
                                    <Input type="text" disabled={true} value={moment(calculation.contract.startDate).format('DD.MM.YYYY.')} />
                                </Col>
                                <Label className="form-label" md={2}><strong>End date:</strong></Label>
                                <Col md={3}>
                                    <Input type="text" disabled={true} value={moment(calculation.contract.endDate).format('DD.MM.YYYY.')} />
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </div>
            </StyleRoot>
        </Col> : null

        return (
            <div>
                <Container fluid>
                    <Row>
                        <Col md={5}>
                            <Card>
                                <CardHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>
                                    {this.props.match.params.id ? 'Edit calculation' : 'Create calculation'}

                                </CardHeader>
                                <CardBody>
                                    <Row>
                                        <Label className="form-label" for="date" md={4}><strong>Date Calculation</strong></Label>
                                        <Col md={5}>
                                            <DatePicker
                                                className="date"
                                                selected={calculation.dateCalculation}
                                                timeInputLabel="Time:"
                                                onChange={this.handleChangeDate}
                                                isClearable={this.props.match.params.id == null ? true : false}
                                                minDate={new Date()}
                                                dateFormat="dd.MM.yyyy."
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                placeholderText="Date"
                                                disabled={this.props.match.params.id == null ? false : true}
                                            />
                                        </Col>
                                    </Row>

                                    <br></br>
                                    <Row>
                                        <Label className="form-label" for="contract" md={4}><strong>Contract</strong></Label>
                                        <Col md={5}>
                                            <Typeahead
                                                clearButton
                                                selected={calculation.contract !== undefined ? contracts.filter(contract => contract.id === calculation.contract.id) : null}
                                                id="contract"
                                                labelKey="contractNumber"
                                                onChange={this.handleChangeContracts}
                                                options={contracts}
                                                placeholder="Select contract..."
                                                disabled={this.props.match.params.id == null ? false : true}
                                                renderMenuItemChildren={(option) => (
                                                    <div>
                                                        <strong>{option.contractNumber}</strong>
                                                        <div>
                                                            <small>{option.student.name} {option.student.lastName}</small>
                                                        </div>
                                                        <div>
                                                            <small>{option.partner.name}</small>
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        </Col>

                                    </Row>
                                    <br></br>
                                    <Row>
                                        <Label className="form-label" for="hours" md={4}><strong>Hours</strong></Label>
                                        <Col md={4}>
                                            <Input type="number" name="hours" id="hours" placeholder="Hours" min={0} step={1} autoComplete="off" onChange={this.handleChange} value={calculation.hours}>
                                            </Input>
                                        </Col>
                                    </Row>
                                    <br></br>
                                    <Row>
                                        <Label className="form-label" for="bonusHours" md={4}><strong>Bonus Hours</strong></Label>
                                        <Col md={4}>
                                            <Input type="number" name="bonusHours" id="bonusHours" placeholder="Bonus hours" min={0} step={1} autoComplete="off" onChange={this.handleChange} value={calculation.bonusHours}>
                                            </Input>
                                        </Col>
                                    </Row>

                                    <Button style={{ float: 'right' }}
                                        type="button" color="success" disabled={!buttonDisabled} onClick={this.toggleCalculator}><FontAwesomeIcon icon={faCalculator}></FontAwesomeIcon>
                                    </Button>
                                </CardBody>
                            </Card>
                            <br></br>
                            {this.state.calculationCard && cardCalculation}
                        </Col>
                        {cardContract}
                    </Row>
                </Container>
            </div>
        );
    }
}

export default withToastManager(withCookies(withRouter(CreateCalculation)));