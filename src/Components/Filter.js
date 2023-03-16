import React, { useState } from "react";
import { CloseButton, Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useNavigate } from "react-router-dom";

export default function Filter(props) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    tags: {
      animal: { cat: false, otter: false },
      encounter: { happy: false, unhappy: false },
    },
  });
  const filterVal = [];

  const handleSubmit = (e) => {
    e.preventDefault();
    filterFunction(filter);
    props.handleDataFromFilter(filterVal);
    navigate("/");
  };

  const handleReset = (e) => {
    e.preventDefault();
    props.handleResetFromFilter(undefined, undefined);
    navigate("/");
  };

  const allFilterClickListener = (e, filterProp) => {
    const name = e.target.value;
    setFilter((prevState) => ({
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
    filterVal.push(animalFilterVal[0][0]);
    filterVal.push(encounterFilterVal[0][0]);
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
            <Form.Group className="form-group" controlId="filter-input">
              <Form.Label>Animals</Form.Label>
              <div className="radioButtons">
                <Button
                  value="cat"
                  variant={filter.tags.animal.cat ? "dark" : "light"}
                  onClick={(e) => allFilterClickListener(e, "animal")}
                  disabled={filter.tags.animal.otter}
                >
                  cat
                </Button>
                <Button
                  value="otter"
                  variant={filter.tags.animal.otter ? "dark" : "light"}
                  onClick={(e) => allFilterClickListener(e, "animal")}
                  disabled={filter.tags.animal.cat}
                >
                  otter
                </Button>
                <br />
                <Form.Label>Encounters</Form.Label>
                <br />
                <Button
                  value="happy"
                  variant={filter.tags.encounter.happy ? "dark" : "light"}
                  onClick={(e) => allFilterClickListener(e, "encounter")}
                  disabled={filter.tags.encounter.unhappy}
                >
                  happy
                </Button>
                <Button
                  value="unhappy"
                  variant={filter.tags.encounter.unhappy ? "dark" : "light"}
                  onClick={(e) => allFilterClickListener(e, "encounter")}
                  disabled={filter.tags.encounter.happy}
                >
                  unhappy
                </Button>
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
