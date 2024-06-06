import styled from 'styled-components';
import {
  borderSize,
  borderRadius,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorText,
  colorGrayLighter,
  colorBlueLight,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';

const RemoteDesktopHeader = styled.header`
  margin: 0;
  padding: 0;
  border: none;
  line-height: 2rem;
`

const RemoteDesktopContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0;
  margin-right: auto;
  margin-left: auto;
  width: 100%;
`

const RemoteDesktopModal = styled(ModalSimple)`
  padding: 1rem;
  min-height: 30rem;
`

const CloseButton = styled(Button)`
  position: relative;
  background-color: var(--color-white);

  i {
    color: var(--color-gray-light);
  }

  &:focus,
  &:hover{
    background-color: var(--color-gray-lighter);
    i{
      color: var(--color-gray);
    }
  }
`

const StartButton = styled(Button)`
  display: flex;
  align-self: center;

  &:focus {
    outline: none !important;
  }

  & > i {
    color: #3c5764;
  }

  margin: 0;
  display: block;
  position: absolute;
  bottom: ${mdPaddingX};
`

const Title = styled.h3`
  text-align: center;
  font-weight: 400;
  font-size: 1.3rem;
  white-space: normal;

  @include mq(var(--small-only)) {
    font-size: 1rem;
    padding: 0 1rem;
  }
`

const RemoteDesktopUrl = styled.div`
  margin: 0 ${borderSize} 0 ${borderSize};

  & > label {
    display: block;
  }

  & > label input {
    display: block;
    margin: 10px 0 10px 0;
    padding: 0.4em;
    color: ${colorText};
    line-height: 2rem;
    width: 100%;
    font-family: inherit;
    font-weight: inherit;
    border: 1px solid ${colorGrayLighter};
    border-radius: ${borderRadius};

    ${({ animations }) => animations && `
      transition: box-shadow .2s;
    `}

    &:focus {
      outline: none;
      border-radius: ${borderSize};
      box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
    }
  }

  & > span {
    font-weight: 600;
  }
`

const UrlError = styled.div`
  color: red;
  padding: 1em 0 2.5em 0;

  :global(.animationsEnabled) & {
    transition: 1s;
  }
`

export default {
  UrlError,
  StartButton,
  CloseButton,
  Title,
  RemoteDesktopUrl,
  RemoteDesktopModal,
  RemoteDesktopContent,
  RemoteDesktopHeader,
};
