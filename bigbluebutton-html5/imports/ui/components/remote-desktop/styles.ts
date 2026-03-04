import styled from 'styled-components';

type ContainerProps = {
  isResizing: boolean;
  isMinimized: boolean;
};

type VncWrapperProps = {
  fullscreen: boolean;
};

export const Container = styled.span<ContainerProps>`
  position: absolute;
  pointer-events: inherit;
  background: var(--color-black);
  overflow: hidden;

  ${({ isResizing }) => isResizing && `
    pointer-events: none;
  `}
  ${({ isMinimized }) => isMinimized && `
    display: none;
  `}
`;

export const VncWrapper = styled.div<VncWrapperProps>`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;

  ${({ fullscreen }) => fullscreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99;
  `}
`;

export default {
  Container,
  VncWrapper,
};
