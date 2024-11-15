import React from "react";

function ListGroup(props) {
  const {
    items,
    textProperty,
    valueProperty,
    selectedItem,
    onItemSelect,
    usedIn,
  } = props;

  return (
    <ul className="list-group">
      {items.map((item) => (
        <li
          onClick={() => {
            onItemSelect(item);
          }}
          key={item[valueProperty]}
          className={
            usedIn === "Subject"
              ? item === selectedItem
                ? "list-group-item list-group-item-dark active"
                : "list-group-item list-group-item-dark"
              : item[valueProperty] === selectedItem?.[valueProperty]
              ? "list-group-item list-group-item-dark active"
              : "list-group-item list-group-item-dark"
          }
          style={{ cursor: "pointer" }}
        >
          {item[textProperty]}
        </li>
      ))}
    </ul>
  );
}

ListGroup.defaultProps = {
  textProperty: "name",
  valueProperty: "_id",
};

export default ListGroup;
