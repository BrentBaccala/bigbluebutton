import styled from 'styled-components';
import VncDisplay from 'react-vnc-display';

const StyledVncDisplay = styled(VncDisplay)`
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  flex-shrink: 1;
  position: absolute;
  overflow-x: hidden;
  overflow-y: auto;
  border-style: none;
  border-bottom: none;
`;

const StyledDiv = styled.div`
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  flex-shrink: 1;
  position: absolute;
  overflow-x: hidden;
  overflow-y: auto;
  border-style: none;
  border-bottom: none;
`;

export default {
  StyledVncDisplay,
  StyledDiv,
};
