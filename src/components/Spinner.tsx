import styled, {keyframes} from 'styled-components';

function Spinner() {
    const Main = styled.main`
      width: 100%;
      height: 100%;
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    const spin = keyframes`
      to {
        -webkit-transform: rotate(360deg);
      }
    `;

    const Div = styled.div`
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 255, 255, .3);
      border-radius: 50%;
      border-top-color: crimson;
      animation: ${spin} 1s ease-in-out infinite;
      -webkit-animation: ${spin} 1s ease-in-out infinite;
    `;

    return (
        <Main>
            <Div id="spinner"/>
        </Main>
    )
}

export default Spinner;