import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

const connectionDone = () => {
    const localData = JSON.parse( localStorage.getItem('localData') || '[]' ) 
    const newLocalResult = []
    localData.forEach(local => {
        axios.post(local.url, local.data)
        .then(response => console.log(response.data, 'success') )
        .catch(error => {
            if(error.response){
                newLocalResult.push({ ...local, error: error.response.data })
            }
        })
    });
    localStorage.setItem('localData', JSON.stringify(newLocalResult))
}

const setTimeTry = (cb = null) => {
    window.setTimeout(() => {
        axios.get('http://localhost:15000')
        .then(response=> {
            console.log('connected')
            connectionDone()
            if(cb) cb()
        } )
        .catch(error => {
            console.log('no connection yet')
            setTimeTry()
        } )
    }, 20 * 1000)
}

class App extends React.Component {

    constructor(props){
        super();
        this.state = {
            connected: true
        }
    }

    handleDataOffline(url, data){
        const localData = JSON.parse( localStorage.getItem('localData') || '[]' )
        localData.push({ data, url })
        localStorage.setItem('localData', JSON.stringify(localData))

        if(this.state.connected === true){
            this.setState({ connected: false }, () => {
                setTimeTry(() => {
                    this.setState({ connected: false });
                })
            })   
        }     
        
    }

    handleClick(){
        const data = {ok: true}
        const url = 'http://localhost:15000/';

        axios.post(url, data)
        .then(result => {
            console.log(result.data)
        })
        .catch(error => {
            if(error.response){
                // ERRO RESPONDIDO PELO SERVIDOR
            } else if(error.request){
                // ERRO QUE FOI ENVIADO MAS NAO RECEBEU NADA ( SERVER OFFLINE )
                this.handleDataOffline(url, data)
            } else {                
                // REQUISICAO NAO FOI ENVIADA (FALHA NA INTERNET)
                this.handleDataOffline(url, data)
            }
        })
    }

    render(){
        return(
            <div>
                <h1>React Offline</h1>
                <br />
                <div>
                    <button onClick={() => this.handleClick()}>
                        Enviar Requisição ({' ok: true '})
                    </button>
                </div>
            </div>
        );
    }

}

ReactDOM.render(<App />, document.getElementById('root'));