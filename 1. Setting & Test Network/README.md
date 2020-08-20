# Setting & 1st Example

(Ubuntu 18.04 기준, WSL2 사용 - Window Version 2004 이상)

hyperledger-fabric 공식 레퍼런스 참조 (https://hyperledger-fabric.readthedocs.io/en/release-2.2)

1. Prerequisites

Git, cURL, wget, docker(version 17.06.2 ce 이상), docker-compose(version 1.14.0 이상), Go(version 1.13.x 이상), Node.js(version 10.15.3 이상), Python(version 2.7)

```shell script
sudo apt-get install build-essential
```

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

- Docker & Docker compose 설치 (Ubuntu 용, WSL2에서는 Docker for Window 사용)
```shell script
sudo apt-get update && sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update && sudo apt-cache search docker-ce
sudo apt-get update && sudo apt-get install docker-ce
sudo usermod -aG docker $USER
sudo service docker restart (or sudo chmod 666 /var/run/docker.sock)
docker --version
sudo systemctl start docker
sudo systemctl enable docker

sudo curl -L https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```
마지막에서 네 번째 문장은 시스템 실행될때 도커 키기 위함.

- Node.js & npm 설치
```shell script
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

# update 시
sudo npm cache clean -f 
sudo npm install -g n 
sudo n stable

sudo curl -L https://npmjs.org/install.sh | sh
sudo npm update -g npm
```

- Go 설치
```shell script
mkdir golang && cd golang
wget https://dl.google.com/go/go1.14.linux-amd64.tar.gz

sudo tar -zxvf go1.12.9.linux-amd64.tar.gz -C /usr/local
export PATH=$PATH:/usr/local/go/bin
go version
go env

vim .bashrc
# export PATH=$PATH:/usr/local/go/bin
# export GOPATH=$HOME/go 입력
source .bashrc
```

2. Install Sample

curl 이용해 제일 최신 버전의 fabric-sample 과 하이퍼레저 패브릭 바이너리 파일 받아오기

<fabric 버전> <fabric-ca 버전>: -- 뒤에 붙을 것, -- 부터 없으면 최신버전 가져옴.
```shell script
curl -sSL https://bit.ly/2ysbOFE | bash -s
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.0 1.4.7
export PATH=<path to download location>/bin$PATH
```

3. First Sample - test network

노드들이 Docker Compose 네트워크 안에서 분리된 형태, 지금은 cryptogen tool을 이용해서 하지만, certificate authorities 를 통해서도 네트워크 구성 가능

각 노드와 사용자들은 네트워크에 참여하기 위해 조직에 속해있어야 함. 컨소시움이라고도 불림. 또한 네트워크 Ordering을 담담하는 Orderer Organization 필요

channel이 default(mychannel)이 아닌경우 -c 옵션이 붙어야함.

channel 이름은 소문자만.

1개의 orderer 노드와 2개의 peer 노드를 생성할 수 있음. 이전에 수행한 적이 있다면 ./network.sh down 수행

각 Org마다 Peer 1개씩 가지고 있음. 피어들이 트랜잭션을 생성하고, 블록에 넣지만 순서는 Ordering node 가 진행

Test network에서는 Single node raft ordering service가 Ordering 조직에 의해 작동됨. 
```shell script
cd fabric-samples/test-network
./network.sh down
./network.sh.up
./network.sh createChannel -c beomschannel
./network.sh deployCC -c beomschannel
```

실제 프로젝트에서는 ordering 노드가 여러개가 되며 ordering 노드들은 Raft 합의 알고리즘 사용해 block 생성하고 블록체인을 하나의 체인으로 유지.

채널은 특정 네트워크 참여간 소통을 위한 특점 private layer이다. 채널에 초대된 가입된 조직만 원장 소지하고 트랜잭션 검증을 한다.

트랜잭션이 타당하다는 것이 확실하게 되기 위해서는 조직의 서명이 필요, 트랜잭션에 서명하기 위해 체인코드를 실행하고 그 결과값에 서명
서명된 결과값이 모두 일치할 경우에만 commit 된다. 체인코드는 피어에게 설치되고, 채널에 배포됨.
채널에 배포되기 전에는 채널의 멤버들이 조직의 동의 수만큼 동의하면 채털에 배포됨.

채널의 이름을 명시할 경우 -c, 언어를 선택할 경우 -ccl

`Peer` CLI 쓸 경우 해야 되는 일. (testnetwork 폴더에서 진행)
```shell script
export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/
```

```shell script
# Environment variables for Org1 for operate `peer` CLI
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```
CORE_PEER_TLS_ROOTCERT_FILE 과 CORE_PEER_MSPCONFIGPATH 는 Org1의 organizations 의 crypto material 폴더 가리킴. 
point to the Org1 crypto material in the organizations folder.

- 원장 초기화
```shell script
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'
```

- 체인코드 쿼리
```shell script
peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}'
```
- 결과 
```shell script
[
  {"ID": "asset1", "color": "blue", "size": 5, "owner": "Tomoko", "appraisedValue": 300},
  {"ID": "asset2", "color": "red", "size": 5, "owner": "Brad", "appraisedValue": 400},
  {"ID": "asset3", "color": "green", "size": 10, "owner": "Jin Soo", "appraisedValue": 500},
  {"ID": "asset4", "color": "yellow", "size": 10, "owner": "Max", "appraisedValue": 600},
  {"ID": "asset5", "color": "black", "size": 15, "owner": "Adriana", "appraisedValue": 700},
  {"ID": "asset6", "color": "white", "size": 15, "owner": "Michel", "appraisedValue": 800}
]
```
- --peerAddresses flag 옵션이 필요한 이유: 체인코드가 Org1, Org2 모두의 서명이 필요하기 때문에 두 Org의 peer들을 호출해야함.
- -- tlsRootCertFiles 필요한 이유: 각 peer들의 tls 인증서도 필요하기 때문에
```shell script
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"TransferAsset","Args":["asset6","Christopher"]}'
```

```shell script
# Environment variables for Org2

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
```

```shell script
eer chaincode query -C mychannel -n basic -c '{"Args":["ReadAsset","asset6"]}'
```

```shell script
./network.sh down
```

4. Bring up the network with Certificate Authorities
- 모든 노드는 그들의 신분을 증명하기 위해 공개인증서와 개인키가 필요
- testnet 에서는 cryptogen이라는 tool이 certificate와 key 생성해줌.
- 명령어 통해 생성하는 과정 볼 수 있음.
```shell script
./network.sh up
```

실제 제품에서는 각 조직이 조직에 속해있는 CA를 생성한 뒤 이 CA에서 조직의 모든 인증서가 나온다.
- cryptogen 보다 시간은 좀 걸리지만 제품에서 네트워크가 어떻게 배포되는지 보여줌.
- 또한 SDK를 통해 Client 신분을 등록할 수 있고, 어플리케이션의 인증서와 개인키를 만든다.
```shell script
./network.sh up -ca
```

1. 조직 별 CA 먼저 만든다.
2. 각 조직의 CA로 피어와 노드 확인하기 위해 Fabric Client 사용, MSP 폴더 생성 (인증 정보 담김)
3. Admin User의 인증서는 signcerts에서 확인, 개인키는 keyfolder에서 확인 `organization/fabric-ca` 폴더의 `registerEnroll.sh`를 통해 CA 실행
