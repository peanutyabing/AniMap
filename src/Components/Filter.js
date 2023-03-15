import React, { useState } from "react";
import { CloseButton, Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useNavigate } from "react-router-dom";

export default function Filter(props) {
  const navigate = useNavigate();

  const [filterParam, setFilterParam] = useState("");
  const [filterVal, setFilterVal] = useState("");

  const handleChange = (e) => {
    setFilterParam(e.target.name);
    setFilterVal(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    props.handleDataFromFilter(filterParam, filterVal);
    navigate("/");
  };
  const handleReset = (e) => {
    e.preventDefault();
    props.handleDataFromFilter(undefined, undefined);
    navigate("/");
  };

  return (
    <div>
      <Offcanvas show={true} className="offcanvas">
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
              <Form.Label>Animals</Form.Label>
              <div className="radioButtons">
                <Form.Check
                  inline
                  label="cat"
                  value="cat"
                  name="animal"
                  type="radio"
                  id="radio-cat"
                />
                <Form.Check
                  inline
                  label="otter"
                  value="otter"
                  name="animal"
                  type="radio"
                  id="radio-otter"
                />
              </div>
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
            <Button type="submit">Filter</Button>{" "}
            <Button type="reset" onClick={handleReset}>
              Remove Filter
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
