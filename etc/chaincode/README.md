# Chaincode Example

Version: Mac OS X

1. 기존 패브릭 네트워크 가져와서 실행
일단 샘플 네트워크에서 다 복사
```shell script
cd example/test-network
./network.sh up createChannel
```

2. node.js 용 체인코드 작성
```shell script
rm -rf chaincode
mkdir chaincode
cd chaincode
mkdir message

npm init -y
npm install --save fabric-contract-api
npm install --save fabric-shim
```

> package.json 에 script 부분 "start": "fabric-chaincode-node start" 추가

3. chaincode 수정
test-network/scripts/deployCC 가서

```shell script
elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
	CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
	CC_SRC_PATH="../chaincode/message/javascript/"

peer chaincode query -C $CHANNEL_NAME -n fabcar -c '{"Args":["queryAllMsgs"]}' >&log.txt
```

로 자바스크립트 부분 수정해줌.

```shell script
./network.sh deployCC -l javascript

export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

```shell script
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n fabcar --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"createMsg","Args":["MSG2","inomp","you","Hi!!","2020-06-19 17:00:00"]}'
peer chaincode query -C mychannel -n fabcar -c '{"Args":["queryAllMsgs"]}'
```

```shell script
./network.sh down
```


