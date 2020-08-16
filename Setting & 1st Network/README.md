# Setting & 1st Example

(Ubuntu 18.04 기준, 현재 하드웨어: 메모리 2GB, 용량 10GB)

hyperledger-fabric 공식 레퍼런스 참조 (https://hyperledger-fabric.readthedocs.io/en/release-2.2)

1. Prerequisites

Git, cURL, wget, docker(version 17.06.2 ce 이상), docker-compose(version 1.14.0 이상), Go(version 1.13.x 이상), Node.js(version 10.15.3 이상), Python(version 2.7)

- Git 설치:
```shell script
sudo add-apt-repository ppa:git-core/ppa
sudo apt-get update && sudo apt-get dist-upgrade
sudo apt-get install git-core
git version
```
- cURL 설치
```shell script
sudo apt-get install -y curl
curl --version
```

- Docker & Docker compose 설치
```shell script
sudo apt-get update && sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update && sudo apt-cache search docker-ce
sudo apt-get update && sudo apt-get install docker-ce
sudo usermod -aG docker $USER
sudo service docker restart
docker --version
sudo systemctl start docker
sudo systemctl enable docker

sudo curl -L https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```
마지막에서 네 번째 문장은 시스템 실행될때 도커 키기 위함.

2. Install Sample

curl 이용해 제일 최신 버전의 fabric-sample 과 하이퍼레저 패브릭 바이너리 파일 받아오기

<fabric 버전> <fabric-ca 버전>: -- 뒤에 붙을 것, -- 부터 없으면 최신버전 가져옴.
```shell script
curl -sSL https://bit.ly/2ysbOFE | bash -s
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.0 1.4.7
export PATH=<path to download location>/bin$PATH
```

3. First Sample - test network

channel이 default(mychannel)이 아닌경우 -c 옵션이 붙어야함.

channel 이름은 소문자만.

1개의 orderer 노드와 2개의 peer 노드를 생성할 수 있음. 이전에 수행한 적이 있다면 ./network.sh down 수행

```shell script
cd fabric-samples/test-network
./network.sh down
./network.sh.up
./network.sh createChannel -c beomschannel
./network.sh deployCC -c beomschannel
```

실제 프로젝트에서는 ordering 노드가 여러개가 되며 ordering 노드들은 Raft 합의 알고리즘 사용해 block 생성하고 블록체인을 하나의 체인으로 유지.

```shell script
export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/
```

```shell script
# Environment variables for Org1

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

- 체인코드 쿼리
```shell script
peer chaincode query -C beomschannel -n fabcar -c '{"Args":["queryAllCars"]}'
```
- --peerAddresses flag 옵션이 필요한 이유: 체인코드가 Org1, Org2 모두의 서명이 필요하기 때문에 두 Org의 peer들을 호출해야함.
```shell script
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C beomschannel -n fabcar --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"changeCarOwner","Args":["CAR9","Dave"]}'
```

```shell script
# Environment variables for Org2

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
```

- CAR9의 주인이 바뀐 것을 확인할 수 있음.
```shell script
peer chaincode query -C beomschannel -n fabcar -c '{"Args":["queryAllCars"]}'
```

```shell script
./network.sh down
```

4. Bring up the network with Certificate Authorities
- cryptogen이라는 tool이 certificate와 key 생성해줌.
- 명령어 통해 생성하는 과정 볼 수 있음.
```shell script
./network.sh up
```

- cryptogen 통해 시간은 좀 걸리지만 Certificate Authorities (CAs)도 생성 가능
```shell script
./network.sh up -ca
```