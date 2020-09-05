import React, { Component } from 'react';
import { Container, Row, Card, CardBody, Col, Label, Input, Button,  Spinner,CardHeader } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withToastManager } from 'react-toast-notifications';
import axios from 'axios';
import moment from 'moment';
import { Typeahead } from 'react-bootstrap-typeahead';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faCog } from '@fortawesome/free-solid-svg-icons';
import CardFooter from 'reactstrap/lib/CardFooter';
import Radium, { StyleRoot } from 'radium';
import bounceInRight from 'react-animations/lib/bounce-in-right';

class CreateReceipt extends Component {

  emptyReceipt = {
    date: null,
    maturity: null,
    neto: '',
    calculation: {
      id: null,
      number: '',
      hours: '',
      bonusHours: '',
      date: '',
      contract: {
        id: null,
        description: '',
        startDate: '',
        endDate: '',
        partner: {
          name: '',
          oib: '',
          location: '',
          city: {
            name: ''
          }
        }
      }
    }
  };

  patchReceipt = {};

  constructor(props) {
    super(props);
    const { cookies, toastManager } = props;
    this.state = {
      receipt: this.emptyReceipt,
      initialReceipt: this.emptyReceipt,
      patchReceipt: this.patchReceipt,
      isLoading: false,
      calculations: [],
      receiptsCard: false,
      randomNumber: 0

    };
    this.toastManager = toastManager;
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeMaturity = this.handleChangeMaturity.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.handleChangeCalculations = this.handleChangeCalculations.bind(this);
    this.toggleReceipt = this.toggleReceipt.bind(this);
    this.createReceipt = this.createReceipt.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let initialReceipt = { ...this.state.initialReceipt };
    let receipt = { ...this.state.receipt };
    receipt[name] = value;

    let patchReceipt = { ...this.state.patchReceipt };
    if (receipt[name] !== initialReceipt[name]) {
      patchReceipt[name] = value;
    } else {
      patchReceipt[name] = null;
    }

    this.setState({ receipt: receipt, patchReceipt: patchReceipt });
  }

  async componentDidMount() {
    this.getAllCalculations();
  }

  toggleReceipt() {
    this.setState({ receiptsCard: !this.state.receiptsCard })
    console.log(this.state.receiptsCard)
  }

  handleChangeDate(date) {
    this.setState({
      receipt: { ...this.state.receipt, date: date }
    });
  }

  handleChangeMaturity(date) {
    this.setState({
      receipt: { ...this.state.receipt, maturity: date }
    });
  }

  handleChangeCalculations(selectedCalculation) {
    let { receipt } = this.state;
    receipt.calculation = selectedCalculation[0];
    this.setState({ receipt: receipt })
  }


  async getAllCalculations() {
    axios.get('/calculation/all-calculations', {
      headers: {
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
            calculations: response.data,
            isLoading: false
          })
          console.log(response.data)
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          this.toastManager.add("getCalculations " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          }));
      })
  }

  async createReceipt(event) {
    event.preventDefault();
    const { receipt } = this.state;
    this.setState({ isLoading: true });

    await axios({
      method: 'POST',
      url: '/api/v1/receipt',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: receipt,
      withCredentials: true
    })
      .then(response => {
        if (response.status !== 201 && response.status !== 200) {
          this.setState({ isLoading: false },
            () => this.toastManager.add("Undefined error in API: " + response.status, {
              appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
            }));
        } else {
          this.setState({ receipt: this.emptyReceipt, isLoading: false },
            () => this.toastManager.add("Receipt created successfully.", {
              appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
            }));
          this.props.history.push('/receipts')
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          this.toastManager.add("createReceipt " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          }));
      });
  }


  render() {
    const { receipt, isLoading, calculations } = this.state;

    if (isLoading) {
      return (
        <div className="loading-position">
          <Spinner className="grow" color="success" />
        </div>
      )
    }

    const calculationSelected = (receipt.calculation !== undefined ? true : false) && receipt.calculation.id !== null;
    const buttonDisabled = receipt.date && receipt.maturity && receipt.neto && calculationSelected;

    const min = 1;
    const max = 99999;
    const max1 = 66666;
    const max2 = 33333;
    const rand = min + Math.random() * (max - min);
    const rand1 = min + Math.random() * (max1 - min);
    const rand2 = min + Math.random() * (max2 - min);
    const neto = receipt.neto * 1;
    const provizija = receipt.neto * 0.12 * 1;
    const naknada = receipt.neto * 0.005 * 1;
    const mio = receipt.neto * 0.05 * 1;
    const zdravsto = receipt.neto * 0.005 * 1;
    const ukupno = neto + provizija + mio + naknada + zdravsto;
    const styles = {
      bounce: {
          animation: 'x 2s',
          animationName: Radium.keyframes(bounceInRight, 'bounceInRight'),
          animationDuration: '2s'
      }
  }

    const receiptsCard =(receipt.calculation !== undefined && receipt.calculation.number != null) ?
      <Col md={7}>
        <StyleRoot>
                <div className="test" style={styles.bounce}>
        <Card>
          <CardBody>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Receipt  </span>
            <hr></hr>
            <span>Datum : {(receipt.date !== null) ? moment(receipt.date).format('DD.MM.YYYY.') : null}</span> <span style={{ float: 'right' }}> Partner: {receipt.calculation.contract.partner.name} </span><br />
            <span>Dospijeće : {(receipt.maturity !== null) ? moment(receipt.maturity).format('DD.MM.YYYY.') : null}</span><span style={{ float: 'right' }}> Oib: {receipt.calculation.contract.partner.oib} </span> <br />
            <span style={{ float: 'right' }}> Location: {receipt.calculation.contract.partner.location} </span> <br />
            <span style={{ float: 'right' }}> City: {receipt.calculation.contract.partner.city.name} </span>
            <br /><br />
            <span>Poziv na broj: 01 {rand.toFixed(0)}{"-"}{rand1.toFixed(0)}{"-"}{rand2.toFixed(0)} </span><br />
            <hr></hr>
            <span>Za posao koji je izvršen prema priloženom ugovoru broj: {receipt.calculation.contract.contractNumber}</span>
            <hr></hr>
            <span>Ukupno ugovora : 1</span>
            <hr></hr>
            <span style={{ float: 'right' }}>Neto: {receipt.neto} HRK</span> <br />
            <span style={{ float: 'right' }}>Provizija 12%: {provizija.toFixed(2)} HRK</span><br />
            <span style={{ float: 'right' }}>Naknada 0.5%: {naknada.toFixed(2)} HRK</span><br />
            <span style={{ float: 'right' }}>Mio 5%: {mio.toFixed(2)} HRK</span><br />
            <span style={{ float: 'right' }}>Zdravsto 0.5%: {zdravsto.toFixed(2)} HRK</span><br />
            <hr></hr>
            <span style={{ float: 'right', fontWeight: 'bold' }}>Ukupno: {ukupno.toFixed(2)} HRK</span><br />
          </CardBody>
          <CardFooter>
            <Button style={{ float: 'right' }} type="button" color="success" onClick={this.createReceipt}><FontAwesomeIcon icon={faCheckSquare} /></Button>
          </CardFooter>
        </Card>
        </div>
        </StyleRoot>
      </Col> : null;

    return (
      <div>
        <Container fluid>
          <Col>
            <div className="float-right">
              <Button color="success" tag={Link} to="/receipts">View Receipts</Button>
            </div>
            <br />
            <Row>
              <Col md={5}>
                <Card>
                  <CardHeader  style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>
                  <h5 >Create Receipt</h5>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Label className="form-label" for="date" md={4}><strong>Date</strong></Label>
                      <Col md={5}>
                        <DatePicker
                          className="date"
                          selected={receipt.date}
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
                    <br />
                    <Row>
                      <Label className="form-label" for="maturity" md={4}><strong>Maturity</strong></Label>
                      <Col md={5}>
                        <DatePicker
                          className="date"
                          selected={receipt.maturity}
                          timeInputLabel="Time:"
                          onChange={this.handleChangeMaturity}
                          isClearable={this.props.match.params.id == null ? true : false}
                          minDate={new Date()}
                          dateFormat="dd.MM.yyyy."
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          placeholderText="Maturity"
                          popperPlacement="right"
                          disabled={this.props.match.params.id == null ? false : true}
                        />
                      </Col>
                    </Row>
                    <br />
                    <Row>
                      <Label className="form-label" for="neto" md={4}><strong>Neto</strong></Label>
                      <Col md={4}>
                        <Input type="number" name="neto" id="neto" placeholder="Neto" min={0} step={1} autoComplete="off" onChange={this.handleChange} value={receipt.neto}>
                        </Input>
                      </Col>
                    </Row>
                    <br />
                    <Row>
                      <Label className="form-label" for="calculation" md={4}><strong>Calculation</strong></Label>
                      <Col md={5}>
                        <Typeahead
                          clearButton
                          selected={receipt.calculation !== undefined ? calculations.filter(calculation => calculation.id === receipt.calculation.id) : null}
                          id="calculation"
                          labelKey="number"
                          onChange={this.handleChangeCalculations}
                          options={calculations}
                          placeholder="Select calculation..."
                          disabled={this.props.match.params.id == null ? false : true}
                          renderMenuItemChildren={(option) => (
                            <div>
                              <strong>{option.number}</strong>
                              <div>
                                <small>Date: {moment(option.date).format('DD.MM.YYYY.')}</small>
                              </div>
                              <div>
                                <small>Hours: {option.hours}</small>
                              </div>
                              <div>
                                <small>Bonus Hours: {option.bonusHours}</small>
                              </div>
                            </div>
                          )}
                        />
                      </Col>
                    </Row>

                    <Button style={{ float: 'right' }}
                      type="button" color="success" disabled={!buttonDisabled} onClick={this.toggleReceipt}><FontAwesomeIcon icon={faCog}></FontAwesomeIcon>
                    </Button>
                  </CardBody>
                </Card>
              </Col>
              {this.state.receiptsCard && receiptsCard}
            </Row>
          </Col>
        </Container>
      </div>
    );
  }
}

export default withToastManager(withCookies(withRouter(CreateReceipt)));