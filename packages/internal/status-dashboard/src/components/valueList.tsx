import React from 'react';
import { CardKey, CardPair, Panel } from '../styles';

const renderValue = (value) => {
  if (
    ['http://', 'https://'].some((protocol) => value.value.startsWith(protocol))
  ) {
    return (
      <a href={value.value} target="_blank" rel="noopener noreferrer">
        Open
      </a>
    );
  } else {
    return value.value;
  }
};

const ValueList = ({ items }) => {
  if (!items.length) return null;

  return (
    <Panel>
      {items.map((item, i) => (
        <CardPair key={i}>
          <CardKey>{item.label}</CardKey>
          <div style={{ textAlign: 'right' }}>{renderValue(item)}</div>
        </CardPair>
      ))}
    </Panel>
  );
};

export default ValueList;
