import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, Spinner } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withToastManager } from 'react-toast-notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import CardBody from 'reactstrap/lib/CardBody';
import CardHeader from 'reactstrap/lib/CardHeader';


class CreatePartner extends Component {

  emptyPartner = {
    name: '',
    oib: '',
    location: '',
    description: '',
    city: {
      id: null,
      name: ''
    }
  };

  patchPartner = {
    name: null,
    oib: null,
    location: null,
    description: null,
    city: null
  };

  constructor(props) {
    super(props);
    const { cookies, toastManager } = props;
    this.state = {
      partner: this.emptyPartner,
      initialPartner: this.emptyPartner,
      patchPartner: this.patchPartner,
      isLoading: false,
      cities: [],
      validOib: false
    };
    this.toastManager = toastManager;
    this.handleChange = this.handleChange.bind(this);
    this.createOrUpdatePartner = this.createOrUpdatePartner.bind(this);
    this.handleChangeCity = this.handleChangeCity.bind(this);
  }

  async componentDidMount() {
    this.getCitys();
    this.getPartnerById();
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let initialPartner = { ...this.state.initialPartner };
    let partner = { ...this.state.partner };
    partner[name] = value;

    let patchPartner = { ...this.state.patchPartner };
    if (partner[name] !== initialPartner[name]) {
      patchPartner[name] = value;
    } else {
      patchPartner[name] = null;
    }

    this.setState({ partner: partner, patchPartner: patchPartner });
    this.testOib(partner.oib);
  }

  testOib(oib) {
    if (oib === undefined || oib.length === 0) return false;
    const test = require('is-valid-oib')
    if (test(oib)) this.setState({ validOib: true });
    else this.setState({ validOib: false });;
  }


  handleChangeCity(selectedCity) {
    let { partner, patchPartner } = this.state;
    partner.city = selectedCity[0];
    patchPartner.city = partner.city
    this.setState({ partner: partner, patchPartner: patchPartner })

  }

  async getPartnerById() {
    if (this.props.match.params.id !== undefined) {
      this.setState({ isLoading: true });
      await axios.get(`/partner/${this.props.match.params.id}`, {
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
            this.setState({ partner: response.data.partner, initialPartner: JSON.parse(JSON.stringify(response.data.partner)), isLoading: false });
          }
        })
        .catch(error => {
          this.setState({ isLoading: false },
            this.toastManager.add("getPartner " + error.response.status + " " + error.response.statusText, {
              appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
            }));
        })
    } else {
      this.setState({ partner: this.emptyPartner })
    }
  }

  async getCitys() {
    axios.get('/api/all-cities', {
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
            cities: response.data,
            isLoading: false
          })
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          this.toastManager.add("getCitys " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          }));
      })
  }

  async createOrUpdatePartner(event) {
    event.preventDefault();
    const { partner, patchPartner } = this.state;
    this.setState({ isLoading: true });

    await axios({
      method: (partner.id) ? 'PATCH' : 'POST',
      url: (partner.id) ? `/partner/patch/${this.props.match.params.id}` : '/partner/new',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: (partner.id) ? patchPartner : partner,
      withCredentials: true
    })
      .then(response => {
        if (response.status !== 201 && response.status !== 200) {
          this.setState({ isLoading: false },
            () => this.toastManager.add("Undefined error in API: " + response.status, {
              appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
            }));
        } else {
          this.setState({ partner: this.emptyPartner, isLoading: false },
            () => this.toastManager.add(response.status === 200 ? "Partner updated successfully." : "Partner created successfully.", {
              appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
            }));
        }
        this.props.history.push('/partners')
      })
      .catch(error => {
        this.setState({ isLoading: false },
          () => this.toastManager.add("createorUpdatePartner " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          }));
      });
  }

  render() {
    const { partner, isLoading, cities, initialPartner, validOib } = this.state;

    if (isLoading) {
      return (
        <div className="loading-position">
          <Spinner className="grow" color="success" />
        </div>
      )
    }
    const validOibNumber = (validOib && partner.oib.length > 0) ? { valid: true } : { invalid: true };
    const citySelected = (partner.city !== undefined ? true : false) && partner.city.id !== null;
    const buttonDisabled = partner.oib.length === 11 && partner.name.length > 5 && partner.location.length > 5 && partner.description.length > 5 && citySelected;

    return (
      <div>
        <Container fluid>

          <Col>
            <div className="float-right">
              <Button color="success" tag={Link} to="/partners">View Partners</Button>
            </div>

            <Row>
              <Col md={3}>

              </Col>
              <Col md={6}>
                <Card>
                  <CardHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>
                    <h5 className="payment-gateways-titles">{this.props.match.params.id ? 'Edit partner' : 'Create partner'} </h5>

                  </CardHeader>
                  <CardBody>
                    <Form onSubmit={this.createOrUpdatePartner}>

                      <FormGroup row inline>
                        <Label className="form-label" for="oib" md={3}><strong>OIB</strong></Label>
                        <Col md={4}>
                          <Input {...this.props.match.params.id ? null : validOibNumber} disabled={this.props.match.params.id ? true : false} type="text" name="oib" id="oib" placeholder="Oib" autoComplete="off" onChange={this.handleChange} value={partner.oib} />
                        </Col>
                      </FormGroup>

                      <FormGroup row inline>
                        <Label className="form-label" for="name" md={3}><strong>Name</strong></Label>
                        <Col md={7}>
                          <Input type="text" name="name" id="name" placeholder="Name" autoComplete="off" onChange={this.handleChange} value={partner.name} />
                        </Col>
                      </FormGroup>

                      <FormGroup row inline>
                        <Label className="form-label" for="location" md={3}><strong>Location</strong></Label>
                        <Col md={7}>
                          <Input type="text" name="location" id="location" placeholder="Location" autoComplete="off" onChange={this.handleChange} value={partner.location}>
                          </Input>
                        </Col>
                      </FormGroup>
                      <FormGroup row inline>
                        <Label className="form-label" for="description" md={3}><strong>Description</strong></Label>
                        <Col md={7}>
                          <Input type="select" name="description" id="description" onChange={this.handleChange} value={partner.description}>
                            <option value="" disabled="disabled"> Select </option>
                            <option value="DOSTAVA/DISTRIBUCIJA,PRIJEVOZ"> DOSTAVA/DISTRIBUCIJA,PRIJEVOZ</option>
                            <option value="DRUŠTVENA I HUMANISTIČKA PODRUČJA"> DRUŠTVENA I HUMANISTIČKA PODRUČJA</option>
                            <option value="FIZIČKI POSLOVI"> FIZIČKI POSLOVI</option>
                            <option value="FOTOGRAFSKE DJELATNOSTI"> FOTOGRAFSKE DJELATNOSTI</option>
                            <option value="GODIŠNJA,POLUGODIŠNJA,KVARTALNA INVENTURA"> GODIŠNJA,POLUGODIŠNJA,KVARTALNA INVENTURA</option>
                            <option value="GRAĐEVINARSTVO,GEODEZIJA I ARHITEKTURA"> GRAĐEVINARSTVO,GEODEZIJA I ARHITEKTURA</option>
                            <option value="ISTRAŽIVANJE TRŽIŠTA I JAVNOG MIJENJA"> ISTRAŽIVANJE TRŽIŠTA I JAVNOG MIJENJA</option>
                            <option value="JEDNOSTAVNA USLUŽNA ZANIMANJA"> JEDNOSTAVNA USLUŽNA ZANIMANJA</option>
                            <option value="MARKETING"> MARKETING</option>
                            <option value="MEDIJI,UMJETNOST,KULTURA I DIZAJN"> MEDIJI,UMJETNOST,KULTURA I DIZAJN</option>
                            <option value="NOVINARSTVO I LEKTORIRANJE"> NOVINARSTVO I LEKTORIRANJE</option>
                            <option value="ODGOJ,OBRAZOVANJE I EDUKACIJA"> ODGOJ,OBRAZOVANJE I EDUKACIJA</option>
                            <option value="OSTALO"> OSTALO</option>
                            <option value="PODRŠKA KORISNICIMA I CALL CENTAR"> PODRŠKA KORISNICIMA I CALL CENTAR</option>
                            <option value="POLJOPRIVREDA,ŠUMARSTVO,VETERINA I HORTIKULTURA"> POLJOPRIVREDA,ŠUMARSTVO,VETERINA I HORTIKULTURA</option>
                            <option value="POSLOVI ČIŠĆENJA">POSLOVI ČIŠĆENJA </option>
                            <option value="PREHRANA">PREHRANA </option>
                            <option value="PREVOĐENJE I INOKORESPODENCIJA"> PREVOĐENJE I INOKORESPODENCIJA</option>
                            <option value="PROMOCIJE,SAJMOVI,MANIFESTACIJE">PROMOCIJE,SAJMOVI,MANIFESTACIJE </option>
                            <option value="RAČUNOVODSTVO I FINANCIJE"> RAČUNOVODSTVO I FINANCIJE</option>
                            <option value="RAD NA RAČUNALU">RAD NA RAČUNALU </option>
                            <option value="RAD S KORISNICIMA">RAD S KORISNICIMA </option>
                            <option value="RAD U TRGOVINI"> RAD U TRGOVINI</option>
                            <option value="RAD U PROIZVODNJI">RAD U PROIZVODNJI </option>
                            <option value="RAD U UREDU I NA ŠALTERU">RAD U UREDU I NA ŠALTERU </option>
                            <option value="RESTORANI I HOTELI"> RESTORANI I HOTELI</option>
                            <option value="SAJMOVI,MANIFESTACIJE,PROMOCIJE"> SAJMOVI,MANIFESTACIJE,PROMOCIJE</option>
                            <option value="SKLADIŠTENJE I OTPREMA ROBE">SKLADIŠTENJE I OTPREMA ROBE </option>
                            <option value="STROJARSTVO I ELEKTROTEHNIKA">STROJARSTVO I ELEKTROTEHNIKA </option>
                            <option value="STRUČNI ADMINISTRATIVNI POSLOVI">STRUČNI ADMINISTRATIVNI POSLOVI </option>
                            <option value="STRUČNI ICT POSLOVI">STRUČNI ICT POSLOVI </option>
                            <option value="STRUČNI POSLOVI U PREHRAMBENOJ INDUSTRIJI">STRUČNI POSLOVI U PREHRAMBENOJ INDUSTRIJI </option>
                            <option value="TEŽI FIZIČKI POSLOVI">TEŽI FIZIČKI POSLOVI </option>
                            <option value="TRGOVAČKA I SRODNA ZANIMANJA">TRGOVAČKA I SRODNA ZANIMANJA </option>
                            <option value="TURIZAM">TURIZAM </option>
                            <option value="UGOSTITELJSTVO"> UGOSTITELJSTVO</option>
                            <option value="UREDSKI ŠALTERSKI POSLOVI">UREDSKI ŠALTERSKI POSLOVI </option>
                            <option value="ZABAVA,SPORT I REKREACIJA">ZABAVA,SPORT I REKREACIJA </option>
                            <option value="ZDRAVSTVO I NJEGA"> ZDRAVSTVO I NJEGA</option>
                          </Input>
                        </Col>
                      </FormGroup>
                      <FormGroup row inline>
                        <Label className="form-label" for="city" md={3}><strong>City</strong></Label>
                        <Col md={7}>
                          <Typeahead
                            clearButton
                            selected={partner.city !== undefined ? cities.filter(city => city.id === partner.city.id) : null}
                            id="city"
                            labelKey="name"
                            onChange={this.handleChangeCity}
                            options={cities}
                            placeholder="Select city..."
                          />
                        </Col>
                      </FormGroup>
                      <br></br>
                      {this.props.match.params.id ? <Button style={{ float: "right" }} disabled={(JSON.stringify(partner) === JSON.stringify(initialPartner)) || partner.city === undefined} type="submit" color="success"><FontAwesomeIcon icon={faCheckSquare} className="mr-2" /> Update</Button> : <Button disabled={!buttonDisabled} style={{ float: "right" }} type="submit" color="success"><FontAwesomeIcon icon={faCheckSquare} className="mr-2" />Create</Button>}
                    </Form>
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

export default withToastManager(withCookies(withRouter(CreatePartner)));