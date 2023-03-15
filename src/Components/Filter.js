import React, { useState } from "react";
import { CloseButton, Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useNavigate } from "react-router-dom";

export default function Filter(props) {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [filterParam, setFilterParam] = useState("");
  const [filterVal, setFilterVal] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    setFilterParam(e.target.name);
    setFilterVal(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    props.handleDataFromFilter(filterParam, filterVal);
  };

  return (
    <div>
      {/* <Button
        variant="secondary"
        onClick={handleShow}
        className="filter-main-btm"
      >
        Filter
      </Button> */}
      <Offcanvas show={true} onHide={handleClose} className="offcanvas">
        <Offcanvas.Header>
          <Offcanvas.Title>Filter Options</Offcanvas.Title>
          <CloseButton
            onClick={() => {
              navigate("/");
            }}
          ></CloseButton>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group
              className="form-group"
              controlId="filter-input"
              onChange={handleChange}
            >
              <Form.Label>Encounters</Form.Label>
              <div className="radioButtons">
                <Form.Check
                  inline
                  label="happy"
                  value="happy"
                  name="encounter"
                  type="radio"
                  id="radio-happy"
                />
                <Form.Check
                  inline
                  label="Unhappy"
                  value="unhappy"
                  name="encounter"
                  type="radio"
                  id="radio-unhappy"
                />
              </div>
            </Form.Group>
            <Button type="submit">Filter</Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
