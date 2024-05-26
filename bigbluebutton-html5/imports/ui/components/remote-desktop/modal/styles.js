import styled from 'styled-components';
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
  @extend .modal;
  padding: 1.5rem;
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
  align-self: center;
  &:focus {
    outline: none !important;
  }

  i{
    color: #3c5764;
  }

  margin: 0;
  width: 40%;
  display: block;
  position: absolute;
  bottom:   20px;
  color: var(--color-white) !important;
  background-color: var(--color-link) !important;
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
  margin: 0 var(--border-size) 0 var(--border-size);

  label {
    display: block;
  }

  input, select {
    @include inputFocus(var(--color-blue-light));
    display: block;
    margin: 10px 0 10px 0;
    padding: 0.4em;
    color: var(--color-text);
    background-color: rgb(232, 240, 254);
    line-height: 2rem;
    width: 100%;
    font-family: inherit;
    font-weight: inherit;
    border: 1px solid var(--color-gray-lighter);
    border-radius: var(--border-radius);

    :global(.animationsEnabled) & {
      transition: box-shadow .2s;
    }
  }

  span {
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
