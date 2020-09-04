import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Spinner, Card, CardBody, CardHeader } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withToastManager } from 'react-toast-notifications';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import NumberFormat from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker';
import { faAlignRight, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import './CreateStudent.css';
import { storage } from "../../firebase";
import defaultImage from './logo.png';

class CreateStudent extends Component {

    emptyStudent = {
        oib: '',
        name: '',
        lastName: '',
        phone: '',
        email: '',
        dateBirth: null,
        sex: '',
        jmbag: '',
        imageUrl: '',
        faculty: {
            id: null,
            name: '',
            tag: ''
        },
        iban: '',
        city: {
            id: null,
            name: ''
        }
    };

    patchStudent = {
        oib: null,
        name: null,
        lastName: null,
        phone: null,
        email: null,
        dateBirth: null,
        sex: null,
        jmbag: null,
        imageUrl: null,
        faculty: null,
        iban: null,
        city: null
    };

    constructor(props) {
        super(props);
        const { cookies, toastManager } = props;
        this.state = {
            student: this.emptyStudent,
            patchStudent: this.patchStudent,
            initialStudent: this.emptyStudent,
            xsrfToken: cookies.get('XSRF-TOKEN'),
            isLoading: false,
            cities: [],
            faculties: [],
            pictures: [],
            validEmail: false,
            validPhone: false,
            validOib: false,
            avatarImage: ''
        };
        this.toastManager = toastManager;
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeDateBirth = this.handleChangeDateBirth.bind(this);
        this.handleChangeCity = this.handleChangeCity.bind(this);
        this.handleChangeFaculty = this.handleChangeFaculty.bind(this);
        this.generate = this.generate.bind(this);
        this.createOrUpdateStudent = this.createOrUpdateStudent.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleEditPicture = this.handleEditPicture.bind(this);
    }

    async componentDidMount() {
        this.getCitys();
        this.getFacultys();
        this.getStudentById();
        console.log(this.state.student)

    }

    handleChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let student = { ...this.state.student };
        student[name] = value;
        let initialStudent = { ...this.state.initialStudent };
        let patchStudent = { ...this.state.patchStudent };
        if (student[name] !== initialStudent[name]) {
            patchStudent[name] = value;
        } else {
            patchStudent[name] = null;
        }

        const validPhone = this.testPhone(this.state.student.phone)

        this.setState({ student: student, patchStudent: patchStudent, validPhone: validPhone });
        this.testOib(student.oib);
        this.testEmail(student.email);

    }

    handleImageChange = (event) => {
        const image = event.target.files[0];
        const uploadTask = storage.ref(`images/${image.name}`).put(image);
        uploadTask.on(
            "state_changed",
            snapshot => { },
            error => {
                console.log(error);
            },
            () => {
                storage
                    .ref("images")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        let student = { ...this.state.student }
                        student.imageUrl = url
                        let patchStudent = {...this.state.patchStudent}
                        patchStudent.imageUrl = url
                        console.log(url)
                        this.setState({ student: student,patchStudent:patchStudent})
                    })
            }
        )
    };

    handleEditPicture = () => {
        const fileInput = document.getElementById('imageInput');
        fileInput.click();
    };

    handleChangeDateBirth(date) {
        this.setState({ student: { ...this.state.student, dateBirth: date }, patchStudent: { ...this.state.patchStudent, dateBirth: date } });
        console.log(date);
    }

    handleChangeCity(selectedCity) {
        let { student } = this.state;
        student.city = selectedCity[0];

        this.setState({ student: student, patchStudent: { ...this.state.patchStudent, city: selectedCity[0] } })
    }

    handleChangeFaculty(selectedFaculty) {
        let { student } = this.state;
        student.faculty = selectedFaculty[0];

        this.setState({ student: student, patchStudent: { ...this.state.patchStudent, faculty: selectedFaculty[0] } })
    }

    async getStudentById() {
        if (this.props.match.params.id !== undefined) {
            this.setState({ isLoading: true });
            await axios.get(`http://localhost:9088/api1/${this.props.match.params.id}`, {
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
                        console.log(response.data.student)
                        this.setState({ student: response.data.student, initialStudent: JSON.parse(JSON.stringify(response.data.student)), isLoading: false });
                    }
                })
                .catch(error => {
                    this.setState({ isLoading: false },
                        this.toastManager.add("getStudent " + error.response.status + " " + error.response.statusText, {
                            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                })
        } else {
            this.setState({ student: this.emptyStudent })
        }
    }

    async getFacultys() {
        const { xsrfToken } = this.state;

        axios.get('http://localhost:9088/api2/all-faculties', {
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
                        faculties: response.data,
                        isLoading: false
                    })
                    console.log(response.data)
                }
            })
            .catch(error => {
                this.setState({ isLoading: false },
                    this.toastManager.add("getFaculties " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    }));
            })
    }

    async getCitys() {
        const { xsrfToken } = this.state;

        axios.get('http://localhost:9088/api/all-cities', {
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
                        cities: response.data,
                        isLoading: false
                    })
                    console.log(response.data)
                }
            })
            .catch(error => {
                this.setState({ isLoading: false },
                    this.toastManager.add("getCitys " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    }));
            })
    }

    async createOrUpdateStudent(event) {
        event.preventDefault();
        const { student, xsrfToken, patchStudent } = this.state;
        this.setState({ isLoading: true });
        console.log("PATH",patchStudent)

        await axios({
            method: (student.id) ? 'PATCH' : 'POST',
            url: (student.id) ? `http://localhost:9088/api1/patch-student/${this.props.match.params.id}` : 'http://localhost:9088/api1/student',
            headers: {
                'X-XSRF-TOKEN': xsrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: (student.id) ? patchStudent : student,
            withCredentials: true
        })
            .then(response => {
                if (response.status !== 201 && response.status !== 200) {
                    this.setState({ isLoading: false },
                        () => this.toastManager.add("Undefined error in API: " + response.status, {
                            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                } else {
                    this.setState({ student: this.emptyStudent, isLoading: false },
                        () => this.toastManager.add(response.status === 200 ? "Student updated successfully." : "Student created successfully.", {
                            appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                }
                this.props.history.push('/students')
            })
            .catch(error => {
                this.setState({ isLoading: false },
                    () => this.toastManager.add("createorUpdateStudent " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    }));
            });
    }

    generateJmbagCodePart(length) {
        var result = '';
        var characters = '0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    generate() {
        const code = this.generateJmbagCodePart(4) + "-" + this.generateJmbagCodePart(4);
        this.setState({ student: { ...this.state.student, jmbag: code } });
    }

    testEmail(email) {
        if (email === undefined || email.length === 0) return false;
        let emailregex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (emailregex.test(email)) this.setState({ validEmail: true });
        else this.setState({ validEmail: false });
    }

    testPhone(phone) {
        if (phone === undefined || phone.length === 0) return false;
        let phoneregex = /^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$/;
        if (phoneregex.test(phone)) return true;
        else return false;
    }

    testOib(oib) {
        if (oib === undefined || oib.length === 0) return false;
        const test = require('is-valid-oib')
        if (test(oib)) this.setState({ validOib: true });
        else this.setState({ validOib: false });;
    }

    render() {
        let { isLoading, student, cities, initialStudent, validEmail, validOib, faculties } = this.state;

        if (isLoading) {
            return (
                <div className="loading-position">
                    <Spinner className="grow" color="success" />
                </div>
            )
        }

        const validOibNumber = (validOib && student.oib.length === 11) ? { valid: true } : { invalid: true };
        const validEmailAddress = (validEmail && student.email.length > 0) ? { valid: true } : { invalid: true };
        const facultySelected = (student.faculty !== undefined ? true : false) && student.faculty.id !== null;
        const citySelected = (student.city !== undefined ? true : false) && student.city.id !== null;
        const disableSubmit = student.name && student.oib.length === 11 && student.lastName && student.dateBirth && student.sex && validEmailAddress.valid && student.phone && citySelected && facultySelected && student.iban;

        return (
            <div>
                <Container fluid>
                    <Col>
                        <div className="float-right">
                            <Button color="success" tag={Link} to="/students" ><FontAwesomeIcon icon={faAlignRight} className="mr-2" />View Students</Button>
                        </div>
                        <Row>
                            <Col md={7}>
                                <Card>
                                    <CardHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>
                                        <h5 className="payment-gateways-titles">{this.props.match.params.id ? 'Edit student' : 'Create student'} </h5>
                                    </CardHeader>
                                    <CardBody>
                                        <Form onSubmit={this.createOrUpdateStudent}>

                                            <FormGroup row inline>
                                                <Label className="form-label" for="oib" md={3}><strong>OIB</strong></Label>
                                                <Col md={4}>
                                                    <Input {...validOibNumber} type="text" name="oib" id="oib" placeholder="Oib" autoComplete="off" onChange={this.handleChange} value={student.oib} />
                                                </Col>
                                            </FormGroup>

                                            <FormGroup row inline>
                                                <Label className="form-label" for="name" md={3}><strong>First Name</strong></Label>
                                                <Col md={5}>
                                                    <Input type="text" name="name" id="name" placeholder="Name" autoComplete="off" onChange={this.handleChange} value={student.name} />
                                                </Col>
                                            </FormGroup>

                                            <FormGroup row inline>
                                                <Label className="form-label" for="lastName" md={3}><strong>Last Name</strong></Label>
                                                <Col md={5}>
                                                    <Input type="text" name="lastName" id="lastName" placeholder="Last name" autoComplete="off" onChange={this.handleChange} value={student.lastName}>
                                                    </Input>
                                                </Col>
                                            </FormGroup>

                                            <FormGroup row inline>
                                                <Label className="form-label" for="phone" md={3}><strong>Phone number</strong></Label>
                                                <Col md={6}>
                                                    <NumberFormat className="phone" format="+385 (##) ###-####" mask="_" type="text" name="phone" id="phone" autoComplete="off" onChange={this.handleChange} value={student.phone} />

                                                </Col>
                                            </FormGroup>

                                            <FormGroup row inline>
                                                <Label className="form-label" for="email" md={3}><strong>Email</strong></Label>
                                                <Col md={5}>
                                                    <Input {...validEmailAddress} type="text" name="email" id="email" placeholder="Email address" autoComplete="off" onChange={this.handleChange} value={student.email} />
                                                </Col>
                                            </FormGroup>

                                            <FormGroup row inline>
                                                <Label className="form-label" for="dateBirth" md={3}><strong>Date of birth</strong></Label>
                                                <Col md={4}>
                                                    <DatePicker
                                                        className="date"
                                                        selected={student.dateBirth}
                                                        timeInputLabel="Time:"
                                                        onChange={this.handleChangeDateBirth}
                                                        isClearable={true}
                                                        maxDate={new Date()}
                                                        dateFormat="dd.MM.yyyy."
                                                        showMonthDropdown
                                                        timeCaption="Time"
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        placeholderText="Date of Birth"
                                                    />
                                                </Col>
                                            </FormGroup>

                                            <FormGroup row inline>
                                                <Label className="form-label" for="jmbag" md={3}><strong>JMBAG</strong></Label>
                                                <Col md={3}>
                                                    <Input type="text" name="jmbag" id="jmbag" value={student.jmbag} readOnly required />
                                                </Col>
                                                <Col md={2}>
                                                    {this.props.match.params.id == null ?
                                                        <Button color="danger" onClick={this.generate}>Generate</Button> : <span></span>}
                                                </Col>
                                            </FormGroup>


                                            <FormGroup row inline>
                                                <Label className="form-label" for="sex" md={3}><strong>Sex</strong></Label>
                                                <Col md={3}>
                                                    <Input type="select" name="sex" id="sex" autoComplete="off" onChange={this.handleChange} value={student.sex}>
                                                        <option value="" disabled="disabled"> Select </option>
                                                        <option value="Male"> Male</option>
                                                        <option value="Female"> Female</option>
                                                    </Input>
                                                </Col>
                                            </FormGroup>

                                            <FormGroup row inline>
                                                <Label className="form-label" for="faculty" md={3}><strong>Faculty</strong></Label>
                                                <Col md={5}>
                                                    <Typeahead
                                                        clearButton
                                                        selected={student.faculty !== undefined ? faculties.filter(faculty => faculty.id === student.faculty.id) : null}
                                                        id="faculty"
                                                        labelKey="tag"
                                                        onChange={this.handleChangeFaculty}
                                                        options={faculties}
                                                        placeholder="Select faculty..."
                                                        renderMenuItemChildren={(option) => (
                                                            <div>
                                                                {option.tag}
                                                                <div>
                                                                    <small>{option.name}</small>
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                </Col>
                                            </FormGroup>

                                            <FormGroup row inline>
                                                <Label className="form-label" for="iban" md={3}><strong>IBAN</strong></Label>
                                                <Col md={6}>
                                                    <NumberFormat className="iban" type="text" format="HR #### #### #### ####" name="iban" id="iban" placeholder="HR #### #### #### ####" autoComplete="off" onChange={this.handleChange} value={student.iban} />
                                                </Col>
                                            </FormGroup>

                                            <FormGroup row inline>
                                                <Label className="form-label" for="city" md={3}><strong>City</strong></Label>
                                                <Col md={5}>
                                                    <Typeahead
                                                        clearButton
                                                        selected={student.city !== undefined ? cities.filter(city => city.id === student.city.id) : null}
                                                        id="city"
                                                        labelKey="name"
                                                        onChange={this.handleChangeCity}
                                                        options={cities}
                                                        placeholder="Select city..."
                                                    />
                                                </Col>
                                            </FormGroup>

                                            {this.props.match.params.id ? <Button style={{ float: "right" }} disabled={JSON.stringify(student) === JSON.stringify(initialStudent)} type="submit" color="success"><FontAwesomeIcon icon={faCheckSquare} className="mr-2" /> Update</Button> : <Button style={{ float: "right" }} disabled={!disableSubmit} type="submit" color="success"><FontAwesomeIcon icon={faCheckSquare} className="mr-2" />Create</Button>}

                                        </Form>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card>
                                    <CardHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>
                                        <h5>Image </h5>
                                    </CardHeader>
                                    <CardBody >
                                            <img src={this.state.student.imageUrl === "" ? defaultImage : this.state.student.imageUrl}
                                                alt="avatar"
                                                class="center" />
                                            <Input
                                                type="file"
                                                id="imageInput"
                                                name="imageUrl"
                                                hidden="hidden"
                                                onChange={this.handleImageChange}
                                            />
                                        <br></br>
                                        <Button onClick={this.handleEditPicture} color="success"  >Upload</Button>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <br />

                        <br />
                    </Col>

                </Container>
            </div>
        );
    }
}

export default withToastManager(withCookies(withRouter(CreateStudent)));