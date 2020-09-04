import React, { Component } from 'react';
import { Container, Row, Col, Label, Input, Button, Card, Spinner, InputGroupAddon, InputGroup } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withToastManager } from 'react-toast-notifications';
import axios from 'axios';
import CardBody from 'reactstrap/lib/CardBody';
import DatePicker from 'react-datepicker';
import './CreateContract.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faListAlt } from '@fortawesome/free-solid-svg-icons';
import CardHeader from 'reactstrap/lib/CardHeader';


class CreateContract extends Component {

  emptyContract = {
    date: null,
    description: {
      id: null,
      name: ''
    },
    startDate: null,
    endDate: null,
    hourlyRate: null,
    status: '',
    partner: {
      id: null,
      name: '',
      oib: '',
    },
    student: {
      id: null,
      name: '',
      lastName: '',
      jmbag: '',
      oib: '',
      sex: '',
      iban: '',
      email: '',
      phone: ''
    }
  };

  patchContract = {
    date: null,
    description: null,
    startDate: null,
    endDate: null,
    hourlyRate: null,
    status: null,
    partner: null,
    student: null
  }

  constructor(props) {
    super(props);
    const { cookies, toastManager } = props;
    this.state = {
      contract: this.emptyContract,
      initialContract: this.emptyContract,
      patchContract: this.patchContract,
      xsrfToken: cookies.get('XSRF-TOKEN'),
      isLoading: false,
      partners: [],
      students: [],
      descriptions: []
    };
    this.toastManager = toastManager;
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeStudents = this.handleChangeStudents.bind(this);
    this.handleChangePartners = this.handleChangePartners.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeDescriptions = this.handleChangeDescriptions.bind(this);
    this.createOrUpdateContract = this.createOrUpdateContract.bind(this);
  }

  async componentDidMount() {
    this.getAllStudents();
    this.getAllPartners();
    this.getContractById();
    this.getDescriptions();
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let initialContract = { ...this.state.initialContract };
    let contract = { ...this.state.contract };
    contract[name] = value;

    let patchContract = { ...this.state.patchContract };
    if (contract[name] !== initialContract[name]) {
      patchContract[name] = value;
    } else {
      patchContract[name] = null;
    }

    this.setState({ contract: contract, patchContract: patchContract });
  }

  handleChangeDate(date) {
    this.setState({
      contract: { ...this.state.contract, date: date, patchContract: { ...this.state.patchContract, date: date } }
    });
  }

  handleChangeStartDate(date) {
    this.setState({
      contract: { ...this.state.contract, startDate: date, patchContract: { ...this.state.patchContract, startDate: date } }
    });
  }

  handleChangeEndDate(date) {
    this.setState({
      contract: { ...this.state.contract, endDate: date, patchContract: { ...this.state.patchContract, endDate: date } }
    });
  }

  handleChangeDescriptions(selectedDescription) {
    let { contract } = this.state;
    contract.description = selectedDescription[0];

    this.setState({ contract: contract, patchContract: { ...this.state.patchContract, description: selectedDescription[0] } })
  }

  handleChangePartners(selectedPartner) {
    let { contract } = this.state;
    contract.partner = selectedPartner[0];

    this.setState({ contract: contract, patchContract: { ...this.state.patchContract, partner: selectedPartner[0] } })
  }

  handleChangeStudents(selectedStudent) {
    let { contract } = this.state;
    contract.student = selectedStudent[0];

    this.setState({ contract: contract, patchContract: { ...this.state.patchContract, student: selectedStudent[0] } })
  }

  async getDescriptions() {
    const { xsrfToken } = this.state;

    axios.get('http://localhost:9088/v1/api/descriptions', {
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
            descriptions: response.data,
            isLoading: false
          })
          console.log(response.data)
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          this.toastManager.add("getDescriptions " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          }));
      })
  }

  async getAllStudents() {
    const { xsrfToken } = this.state;

    axios.get('http://localhost:9088/api1/students', {
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
            students: response.data,
            isLoading: false
          })
          console.log(response.data)
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          this.toastManager.add("getStudents " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          }));
      })
  }

  async getAllPartners() {
    const { xsrfToken } = this.state;

    axios.get('http://localhost:9088/partner/all-partners', {
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
            partners: response.data,
            isLoading: false
          })
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          this.toastManager.add("getPartners " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          }));
      })
  }

  async createOrUpdateContract(event) {
    event.preventDefault();
    const { contract, xsrfToken, patchContract } = this.state;
    this.setState({ isLoading: true });
    contract.status = "IZDAN";
    console.log()

    await axios({
      method: (contract.id) ? 'PATCH' : 'POST',
      url: (contract.id) ? `http://localhost:9088/contract/patch-contract/${this.props.match.params.id}` : 'http://localhost:9088/contract/new',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: (contract.id) ? patchContract : contract,
      withCredentials: true
    })
      .then(response => {
        if (response.status !== 201 && response.status !== 200) {
          this.setState({ isLoading: false },
            () => this.toastManager.add("Undefined error in API: " + response.status, {
              appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
            }));
        } else {
          this.setState({ contract: this.emptyContract, isLoading: false },
            () => this.toastManager.add(response.status === 200 ? "Contract updated successfully." : "Contract created successfully.", {
              appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
            }));
        }
        this.props.history.push('/contracts')
      })
      .catch(error => {
        this.setState({ isLoading: false },
          () => this.toastManager.add("createorUpdateContract " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          }));
      });
  }

  async getContractById() {
    if (this.props.match.params.id !== undefined) {
      this.setState({ isLoading: true });
      await axios.get(`http://localhost:9088/contract/${this.props.match.params.id}`, {
        headers: {
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
            this.setState({ contract: response.data.contract, initialContract: response.data.contract, isLoading: false });
          }
        })
        .catch(error => {
          this.setState({ isLoading: false },
            this.toastManager.add("getContract " + error.response.status + " " + error.response.statusText, {
              appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
            }));
        })
    } else {
      this.setState({ contract: this.emptyContract })
    }
  }



  render() {
    const { isLoading, contract, partners, students, initialContract, descriptions } = this.state;

    if (isLoading) {
      return (
        <div className="loading-position">
          <Spinner className="grow" color="success" />
        </div>
      )
    }
    const selectedStudent = (contract.student !== undefined ? true : false) && contract.student.id !== null;
    const selectedPartner = (contract.partner !== undefined ? true : false) && contract.partner.id !== null;
    const disableSubmit = /* contract.description && */ contract.hourlyRate && contract.startDate && contract.endDate && selectedStudent && selectedPartner;

    return (
      <div>
        <Container fluid>
          <Col>
            <div className="float-right">
              <Button color="success" tag={Link} to="/contracts"><FontAwesomeIcon icon={faListAlt} /> View Contracts</Button>
            </div>
            <Row>
              <Col md={2}>

              </Col>
              <Col md={8}>

                <Card >
                  <CardHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>
                    <h5 className="payment-gateways-titles">{this.props.match.params.id ? 'Edit contract' : 'Create contract'} </h5>

                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Label className="form-label" for="student" md={3}><strong>Student</strong></Label>
                      <Col md={5}>
                        <Typeahead
                          clearButton
                          selected={contract.student !== undefined ? students.filter(student => student.id === contract.student.id) : null}
                          id="student"
                          labelKey={option => `${option.name} , ${option.lastName} , ${option.jmbag}`}
                          onChange={this.handleChangeStudents}
                          options={students}
                          placeholder="Select student..."
                          disabled={this.props.match.params.id !== undefined ? true : false}
                          renderMenuItemChildren={(option) => (
                            <div>
                              <strong>{option.name}</strong>
                              <div>
                                <small>{option.lastName}</small>
                              </div>
                              <div>
                                <small>{option.jmbag}</small>
                              </div>
                            </div>
                          )}
                        />
                      </Col>
                    </Row>
                    <br />
                    <Row>
                      <Label className="form-label" for="partner" md={3}><strong>Partner</strong></Label>
                      <Col md={4}>
                        <Typeahead
                          clearButton
                          selected={contract.partner !== undefined ? partners.filter(partner => partner.id === contract.partner.id) : null}
                          id="partner"
                          labelKey="name"
                          onChange={this.handleChangePartners}
                          options={partners}
                          placeholder="Select partner..."
                          disabled={this.props.match.params.id !== undefined ? true : false}
                          renderMenuItemChildren={(option) => (
                            <div>
                              <strong>{option.name}</strong>
                              <div>
                                <small>Oib: {option.oib}</small>
                              </div>
                            </div>
                          )}
                        />
                      </Col>
                    </Row>
                    <br />
                    <Row>

                      <Label className="form-label" for="description" md={3}><strong>Description</strong></Label>
                      <Col md={5}>
                        <Typeahead
                          clearButton
                          selected={contract.description !== undefined ? descriptions.filter(description => description.id === contract.description.id) : null}
                          id="description"
                          labelKey="name"
                          onChange={this.handleChangeDescriptions}
                          options={descriptions}
                          placeholder="Select description..."
                        />
                      </Col>
                    </Row>
                    <br />
                    <Row>
                      <Label className="form-label" for="hourlyRate" md={3}><strong>Hourly Rate</strong></Label>
                      <Col md={3}>
                        <InputGroup>
                          <Input type="number" id="hourlyRate" name="hourlyRate" placeholder="Hourly Rate" min={25.39} max={100} step="0.01" onChange={this.handleChange} value={contract.hourlyRate} />
                          <InputGroupAddon addonType="append">HRK</InputGroupAddon>
                        </InputGroup>
                      </Col>
                    </Row>
                    <br />

                    <Row>
                      <Label className="form-label" for="startDate" md={3}><strong>Start Date</strong></Label>
                      <Col md={3}>
                        <DatePicker
                          className="date"
                          selected={contract.startDate}
                          timeInputLabel="Time:"
                          onChange={this.handleChangeStartDate}
                          isClearable={true}
                          minDate={new Date()}
                          dateFormat="dd.MM.yyyy."
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          placeholderText="Start Date"
                        />
                      </Col>
                    </Row>
                    <br />
                    <Row>

                      <Label className="form-label" for="endDate" md={3}><strong>End Date</strong></Label>
                      <Col md={3}>
                        <DatePicker
                          className="date"
                          selected={contract.endDate}
                          timeInputLabel="Time:"
                          onChange={this.handleChangeEndDate}
                          isClearable={true}
                          minDate={new Date()}
                          dateFormat="dd.MM.yyyy."
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          placeholderText="End Date"
                        />
                      </Col>
                    </Row>
                    <br></br>
                    {this.props.match.params.id ? <Button style={{ float: 'right' }} disabled={JSON.stringify(contract) === JSON.stringify(initialContract)} type="submit" color="success" onClick={this.createOrUpdateContract}><FontAwesomeIcon icon={faCheckSquare} className="mr-2" /> Update</Button> : <Button style={{ float: 'right' }} disabled={!disableSubmit} type="submit" color="success" onClick={this.createOrUpdateContract}><FontAwesomeIcon icon={faCheckSquare} className="mr-2" />Create</Button>}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Col>
        </Container>
      </div>
    );
  }
}

export default withToastManager(withCookies(withRouter(CreateContract)));