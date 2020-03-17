# Setting & 1st Example

(Mac OS 기준, hyperledger-fabric 공식 레퍼런스 참조)

1. Prerequisites

Git, cURL, wget, docker(version 17.06.2 이상), docker-compose(version 1.14.0 이상), Go(version 1.13.x 이상), Node.js(version 10.15.3 이상), Python(version 2.7)

```bash
brew install wget
docker --version
docker-compose --version
go version
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
```

2. Install Sample
curl 이용해 제일 최신 버전의 fabric-sample 받아오기

```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s
export PATH=<path to download location>/bin$PATH
```

3. First Sample - test network
channel이 default(mychannel)이 아닌경우 -c 옵션이 붙어야함.
channel 이름은 소문자만.

```bash
cd fabric-samples/test-network
./network.sh down
./network.sh.up
./network.sh createChannel -c beomschannel
./network.sh deployCC -c beomschannel
```


```bash
export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
```

```bash
# Environment variables for Org1

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

- 체인코드 쿼리
```bash
peer chaincode query -C beomschannel -n fabcar -c '{"Args":["queryAllCars"]}'
```
- --peerAddresses flag 옵션이 필요한 이유: 체인코드가 Org1, Org2 모두의 서명이 필요하기 때문에 두 Org의 peer들을 호출해야함.
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C beomschannel -n fabcar --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"changeCarOwner","Args":["CAR9","Dave"]}'
```


```bash
# Environment variables for Org2

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
```

- CAR9의 주인이 바뀐 것을 확인할 수 있음.
```bash
peer chaincode query -C beomschannel -n fabcar -c '{"Args":["queryAllCars"]}'
```

```bash
./network.sh down
```

4. Bring up the network with Certificate Authorities
- cryptogen이라는 tool이 certificate와 key 생성해줌.
- 명령어 통해 생성하는 과정 볼 수 있음.
```bash
./network.sh up
```

- cryptogen 통해 시간은 좀 걸리지면 Certificate Authorities (CAs)도 생성 가능
```bash
./network.sh up -ca
```