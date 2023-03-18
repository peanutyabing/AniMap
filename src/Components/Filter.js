import React, { useState } from "react";
import { CloseButton, Form, FormCheck } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useNavigate } from "react-router-dom";
import RangeSlider from "react-bootstrap-range-slider";

export default function Filter(props) {
  const navigate = useNavigate();
  const [userFilterDays, setUserFilterDays] = useState(0);
  const [filterData, setFilterData] = useState({
    tags: {
      animal: { cat: false, otter: false, bird: false, dog: false },
      encounter: { happy: false, unhappy: false },
    },
  });
  const filterVal = [];

  const handleSubmit = (e) => {
    e.preventDefault();
    filterFunction(filterData);
    filterDates(userFilterDays);
    props.handleDataFromFilter(filterVal);
    navigate("/");
  };

  const handleReset = (e) => {
    e.preventDefault();
    props.handleResetFromFilter(false);
    navigate("/");
  };

  const allFilterClickListener = (e, filterProp) => {
    const name = e.target.value;
    setFilterData((prevState) => ({
      tags: {
        ...prevState.tags,
        [filterProp]: {
          ...prevState.tags[filterProp],
          [name]: !prevState.tags[filterProp][name],
        },
      },
    }));
  };

  const filterFunction = (filter) => {
    const newData = filter;
    const { tags } = newData;
    const animalFilterVal = Object.entries(tags.animal).filter(
      ([key, value]) => value === true
    );
    const encounterFilterVal = Object.entries(tags.encounter).filter(
      ([key, value]) => value === true
    );

    for (let i = 0; i < animalFilterVal.length; i++) {
      filterVal.push(animalFilterVal[i][0]);
    }
    for (let j = 0; j < encounterFilterVal.length; j++) {
      filterVal.push(encounterFilterVal[j][0]);
    }
    return filterVal;
  };

  const filterDates = (userFilterDays) => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() - userFilterDays);
    const newEndDate = new Date(endDate).toLocaleString();
    filterVal.push(newEndDate);
  };
  console.log("filterVal", filterVal);
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
            <Form.Group className="form-filter-group" controlId="filter-input">
              <Form.Label>Animal</Form.Label>
              <div className="checkBoxes">
                <FormCheck
                  id="animal"
                  type="checkbox"
                  value="cat"
                  label="cat"
                  onClick={(e) => allFilterClickListener(e, `${e.target.id}`)}
                />
                <FormCheck
                  id="animal"
                  type="checkbox"
                  value="otter"
                  label="otter"
                  onClick={(e) => allFilterClickListener(e, `${e.target.id}`)}
                />
                <FormCheck
                  id="animal"
                  type="checkbox"
                  value="bird"
                  label="bird"
                  onClick={(e) => allFilterClickListener(e, `${e.target.id}`)}
                />
                <FormCheck
                  id="animal"
                  type="checkbox"
                  value="dog"
                  label="dog"
                  onClick={(e) => allFilterClickListener(e, `${e.target.id}`)}
                />
                <br />
                <Form.Label>Encounter</Form.Label>
                <FormCheck
                  id="encounter"
                  type="checkbox"
                  value="happy"
                  label="happy"
                  onClick={(e) => allFilterClickListener(e, `${e.target.id}`)}
                />
                <FormCheck
                  id="encounter"
                  type="checkbox"
                  value="unhappy"
                  label="unhappy"
                  onClick={(e) => allFilterClickListener(e, `${e.target.id}`)}
                />
                <br />
                <Form.Label>Date Posted</Form.Label>
                <RangeSlider
                  className="range-slider"
                  value={userFilterDays}
                  onChange={(e) => setUserFilterDays(e.target.value)}
                  min={1}
                  max={7}
                  tooltipLabel={(currentValue) =>
                    currentValue === 1
                      ? `${currentValue}day ago`
                      : `${currentValue}days ago`
                  }
                  tooltip="on"
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
