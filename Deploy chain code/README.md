# Deploy Chain code

종단 사용자는 스마트 컨트랙트 호출을 통해 분산원장과 상호작용한다. 스마트 컨트랙트는 체인 코드라는 형태로 배포된다.
원장을 조회하고 검증하기 위해서는 조직은 피어에 체인 코드를 설치해야한다.
채널에 가입된 피어에게 체인코드가 설치되고 나면 채널 멤버들은 채널에 체인코드를 배포할 수 있고, 체인 원장의 자산을 생성하고 업데이트하기 위해 
체인코드 안 스마트 컨트랙트를 사용한다.

프로세스를 사용하는 채널에 배포된 체인코드를 Fabric chaincode lifecycle이라 한다. 이는 트랜잭션을 생성할 때 이용되기 전에 체인코드가 어떻게
동작할 지 여러 조직들이 동의하게 해준다.

체인코드를 test-network 채널에 어떻게 배포하는지 알 수 있다. asset-transfer (basic) 체인코드를 배포해 볼 것이다.

fabric-samples/test-network 사용

1단계: 스마트 컨트랙트 패키지

2단계: 체인코드 패키지 설치

3단계: 체인코드 정의 승인

4단계: 채널에 체인코드 정의 commit

1. javascript 패키지
```json
"dependencies": {
        "fabric-contract-api": "^2.0.0",
        "fabric-shim": "^2.0.0"
}
```
Contract Code 작성 후 npm install
peer CLI 를 통해 체인코드 패키지 만들 수 있음.
```shell script
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
peer version

peer lifecycle chaincode package basic.tar.gz --path ../asset-transfer-basic/chaincode-javascript/ --lang node --label basic_1.0
```
basic.tar.gz 라는 체인코드 패키지를 현재 디렉토리에 만든다.

--label 옵션은 체인코드 설치 후 앞으로 붙일 label, 체인코드 이름과 버전을 포함하는 것을 추천

2. 체인코드패키지 설치

체인코드는 트랜잭션 보증하는 모든 피어에 설치되어야함.
왜냐하면 보증 정책이 모든 조직에서 보증을 받아야 되는걸로 진행하기 때문에

Org1 Peer 먼저 설치
```shell script
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode install basic.tar.gz # 설치
```
peer가 Org1 admin으로 할 수 있게 설정해주고 피어 어드레스 연결

Org2 Peer 설치
```shell script
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
```

return package identifier

3. 체인 코드 정의 승인

`Application/Channel/lifecycleEndorsement` 정책에 의해 관리된다. 보통 주 채널 멤버들이 담당.
```shell script
peer lifecycle chaincode queryinstalled
```
을 통해 패키지 ID 가져옴 (모든 피어들에 동일 - 라벨과 체인코드 바이너리 해시값이기 때문)
```shell script
export CC_PACKAGE_ID=basic_1.0:69de748301770f6ef64b42aa6bb6cb291df20aa39542c3ef94008615704007f3
```
체인코드는 조직 단위로 승인됨. 한 피어에게만 하면 됨.

Org2 승인
```shell script
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```
--sequence: 체인코드 정의 및 업데이트되는지 추적할 타임, 첫 체인코드 배포이기 때문에 1, 업그레이드되면 2

Fabric chanicode shim API에서 제공하는 Low Level API 사용시 --init-required 통해 init 함수 실행

환경변수 바꿔서 Org1도 승인해줌.
```shell script
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

4. Commit

승인여부 확인
```shell script
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name basic --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json
```
```json
{
  "Approvals": {
    "Org1MSP": true,
    "Org2MSP": true
  }
}
```
최종 승인
```shell script
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
```

5. 호출
```shell script
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'
```
```shell script
peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}'
```

6. Upgrade ChainCode

이미 배포된 체인코드를 새로운 package id 로 업그레이드 할 수 있음.

다른 언어로 바꾸고자 할때 Fabric chaincode lifecycle 이용해서 바꿀 수 있음.

기존 언어로도 사용 가능

데이터 추가
```shell script
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"CreateAsset","Args":["asset8","blue","16","Kelley","750"]}'
```