# Developing Application & Commercial Paper

1. Developing Application

하이퍼레저 패브릭을 통해 비즈니스 문제를 풀기 위한 클라이언트 어플리케이션과 스마트 컨트랙트 개발을 알아본다.

여러개의 조직을 포함한 Commercial Paper 시나리어에서 이 목표를 달성하기 위한 모든 컨셉과 일들을 배운다.

블록체인 네트워크는 이미 사용할 수 있다는 것을 가정.

- Solution and application architect
- Client Application Developer
- Smart Contract developer
- Business professional

대상으로 한다.

각각의 주제를 선택해서 읽어보거나 순서대로 읽어보면 된다.

요구사항부터 주요한 개발을 위한 기술적 활동을 다룬다.

2. Commercial Paper Tutorial

MagnetoCorp, DigiBank 두 조직간의 commercial paper를 블록체인 네트워크 PaperNet을 통해 교환한다.

test network를 세팅하고 나면, 당신은 commercial paper를 발행하는 Isabella로 활동한다. (MagnetoCorp),
DigiBank의 직원 Balaji는 commercial paper를 사는 사람이다. 그리고 다시 작은 이익과 함께 MagnetoCorp로 돌려 보낼 수 있다.

개발자, 종단 사용자, 관리자, 각각의 다른 조직으로 행동할 수 있다.

순서대로
- Set up machine and download samples
- Create the network
- Examine the commercial paper smart contract
- Deploy the smart contract the channel by approving the chaincode definition as MagnetoCorp and Digibank.
- Understand the structure of a MagnetoCorp application, including its dependencies
- Configure and use a wallet and identities
- Run a MagnetoCorp application to issue a commercial paper
- Understand how DigiBank uses the smart contract in their applications
- As DigiBank, run applications that buy and redeem commercial paper

(Ubuntu 18.04 기반)

0) Prerequisites

Node.js SDK 위한 필요조건: Node.js Version 12.13.1 이상, npm Ver 6 이상, docker (통합 테스트 위함.)

1) Download Samples

Fabric Prerequisites, Samples 다운로드 하면, tutorial scripts, smart contract, application files 존재

여러 개의 터미널 창을 연다. 예를 들면,
- peer, orderer, CA log output을 위한 것
- MagnetoCorp와 DigiBank의 관리자로서 체인코드 승인하기 위한 것
- 서로 commercial paper를 교환하기 위해 스마트 컨트랙트를 사용할 Isabella와 Balaji가 실행시킬 어플리케이션을 위한 것.

2) Create the network

패브릭 테스트 네트워크를 이용해 스마트 컨트랙트를 배포한다. test network 는 두 peer organizations 와 하나의 ordering organization 으로 이루어진다.
두 peer org는 한 peer를 각각 운영하고, ordering org는 single node raft ordering service를 이용한다.
또한 두 peer orgs가 멤버가 될 싱글 채널 mychannel을 생성한다.

fabric test network는 2 peer organizations (Org1 and Org2), 1 ordering organizations 로 이루어진다. 각 컴포넌트는 docker contatiner로 구동.

각 조직은 그들의 CA를 구동한다. 두 peer, state databases(World state), ordering service node, 각 조직의 CA는 그들의 각각의 Docker contatiner로 구동된다.

실제 제품 환경에서는, 조직은 전형적으로 있는 다른 시스템에서 공유되는 존재하는 CA를 사용한다. 그것들은 Fabric network 전용이 아님.

test network의 두 조직은 별도의 peer를 운영하는 두 개의 조직으로서 우리가 블록체인 원장과의 상호작용을 가능하게 한다. Org1을 DigiBank, Org2를 MagnetoCop로 운용.

```shell script
cd fabric-samples/commercial-paper
./network-starter.sh
docker network inspect net_test
```
Container들은 net_test라는 Docker network를 구성하고.
`docker network inspect net_test` 를 통해 확인.

8개의 컨테이너가 단일 도커 네트워크에 속해 있는 동안 어떻게 다른 IP 주소를 확인하는 지 볼 수 있고,

peer0.org1.example.com이 DigiBank, peer0.org2.example.com이 MagnetoCorp 가 운영한다. 이 시점부터 이 네트워크를 PaperNet이라고 부름.

이제 MagnetoCorp의 입장에서 상업용지 발행하고 교환해보자

3) Monitor the network as MagnetoCorp

각각의 DigiBank, MagnetoCorp 분리된 폴더를 제공함으로써 두 조직으로 행동할 수 있께 함.

두 폴더는 각 조직의 스마트 컨트랙트와 어플리케이션 파일 포함. 왜냐하면 두 조직은 상업용지 교환에서 다른 역할을 하기 때문에,
각 조직별 어플리케이션 파일은 다를 수밖에 없다.

새 창에서 MagnetoCorp Dir로 이동한다.

```shell script
cd fabric-samples/commercial-paper/organization/magnetocorp
``` 

우선 PaperNet의 구성 요소를 살펴볼 것이다. (MagnetoCorp 로써)
관리자는 logspout tool을 사용해 Docker container Set으로부터 모아진 output을 볼 수 있다.
tool은 다른 output 스트림을 한 곳에 모아, 한 창에서 쉽게 볼 수 있게 한다. 관리자가 스마트 컨트랙트를 설치할 때나, 개발자가 스마트 컨트랙트를 invoke 할때 도움이 된다.

MagnetoCorp dir에서 monitordocker.sh를 실행시켜 logsput tool을 실행시킨다.
이미 port 사용중일 경우 port number 넘길 수 있음.

```shell script
(magnetocorp admin)$ ./configuration/cli/monitordocker.sh net_test
./configuration/cli/monitordocker.sh net_test <port_number>
```

이 창은 이제 docker container에서 나온 output 출력 용도이다. 다른 창으로 가서 MagnetoCorp 가 용지 발행하기 위해 사용할 스마트 컨트랙트를 검사한다.

4) Examine the commercial paper smart contract

issue, buy, redeem이 이번 스마트 컨트랙트 핵심, 
어플리케이션이 원장에 상업용지를 발행, 매입, 상환하는 transaction을 제출하기 위해 사용한다.
이제 이 스마트 컨트랙트를 검토해본다.

```shell script
cd commercial-paper/organization/magnetocorp
```
magnetocorp developer 로써 contract 폴더 살펴보기
lib 폴더 안 papercontract.js 가 스마트 컨트랙트

- `const { Contract, Context } = require('fabric-contract-api);`

스마트 컨트랙트에 의해 광범위하게 사용될 두가지 주요 클래스를 포함 시킴. fabric-shim DOCS에서 더 배울 수 있음.

- `class CommercialPaperContract extends Contract {`

주요 트랜잭션 구현 방법 정의

- `async issue(ctx, issuer, paperNumber, issueDateTime, maturityDateTime...)`

issue 트랜잭션 정의, 새 용지 생성 위한 인자값 pass

- `let paper = CommercialPaper.createInstance(issuer, paperNumber, issueDateTime...);`

issue 트랜잭션 안에, 공급된 트랜잭션 input들과 함께 CommercialPaper 클래스를 사용해 새 용지의 메모리를 만든다. buy, redeem 트랜잭션 또한 이 클래스에서
비슷하게 만들어짐.

- `await ctx.paperList.addPaper(paper);`

새 용지를 원장에 추가한다. 스마트 컨트랙트 context (CommercialPaperContext) 가 초기화될때 생성된 PaperList 클래스 instance 인 ctx.paperList를 통해.

- `return paper;`

issue 트랜잭션의 스마트 컨트랙트의 호출자의 응답을 바이너리 버퍼 형태로 return

5) 채널에 스마트 컨트랙트 배포

papercontract가 어플리케이션에게 호출되기 전에, Fabric chaincode lifecycle을 활용해 정의된 채널과, 테스트 네트워크 속 적절한 피어노드에게
설치되어야 한다. Fabric chaincode lifecycle는 여러 조직이 체인코드가 채널에 배포되기 전에 체인코드의
파라미터를 승인하게 한다. 그 결과로, MagnetoCorp와 DigiBank 의 관리자로써 체인코드를 승인하고 설치해야한다.

MagnetoCorp의 관리자가 MagnetoCorp의 Peer에게 papercontract의 복사본을 설치한다.

스마트 컨트랙트는 어플리케이션 개발의 초점이며 체인코드라는 패브릭 요소에 포함되어 있다. 하나 이상의 스마트 컨트랙트는 단일 체인 코드내에서 정의될 수 있으며,
체인 코드를 설치하면 PaperNet의 다른 Organizaiton에서 이를 소비할 수 있게 된다.
관리자만 체인코드에 대해 걱정할 필요가 있다는 것을 의미, 다른 모든 사람들은 스마트 컨트랙트 관점에서 생각 가능하다.

6) Install and approve the smart contract as MagnetoCorp

MagnetoCorp admin 으로써 스마트 컨트랙트를 설치하고 승인한다.

PaperNet과 peer CLI를 통해 소통. 그러나, 관리자는 터미널 창에서 특정 환경 변수를 설정해야함.
정확한 peer binaries set을 사용하기 위해서, MagnetoCorp peer의 주소로 커맨드를 보내기 위해서, 정확한 암호적 자료와 함께 요청에 서명하기 위해서.

스크립트를 통해 환경변수 (현재 튜토리얼은 zsh에서 진행해서 bash에서 진행해야함-shopt명령어 때문에) 설정 가능
```shell script
cd commercial-paper/organization/magnetocorp
exec bash
source magnetocorp.sh
exec zsh
(magnetocorp admin)$ peer lifecycle chaincode package cp.tar.gz --lang node --path ./contract --label cp_0
(magnetocorp admin)$ peer lifecycle chaincode install cp.tar.gz
```
papercontract 스마트 컨트랙트를 설치, 스마트 컨트랙트는 `peer lifecycle chaincode package` 를 통해 체인코드 안에 패키지 되어 들어감
MagnetoCorp의 관리자 창에서 패키지 문장 실행후 설치

```shell script
KST [cli.lifecycle.chaincode] submitInstallProposal -> INFO 001 Installed remotely: response:<status:200 payload:"\nEcp_0:7c36d35cceb8179e20a228b1e66b94254f419741c7bfd3d6d92639006991e576\022\004cp_0" >
KST [cli.lifecycle.chaincode] submitInstallProposal -> INFO 002 Chaincode code package identifier: cp_0:7c36d35cceb8179e20a228b1e66b94254f419741c7bfd3d6d92639006991e576
```

MagnetoCorp admin이 `CORE_PEER_ADDRESS=localhost:9051`로 `peer0.org2.example.com` 커맨드로 설정했기 때문에 `INFO 001 installed remotely...`
는 papercontract 가 peer 의 정상적으로 깔렸다는 것을 의미한다.

스마트 컨트랙트를 설치하고 나서, 우리는 MagnetoCorp로써 papercontract의 체인코드 정의를 승인해야한다.
우선 우리의 peer에 설치한 체인코드의 packageID를 찾는다
```shell script
peer lifecycle chaincode queryinstalled
>Installed chaincodes on peer:
>Package ID: cp_0:7c36d35cceb8179e20a228b1e66b94254f419741c7bfd3d6d92639006991e576, Label: cp_0
```
우리는 packageID가 다음단계에서 필요하고, 환경변수로 저장한다. packageID는 각자 다른 값을 가질것이다. 
```shell script
export PACKAGE_ID=cp:0:7c36d35cceb8179e20a228b1e66b94254f419741c7bfd3d6d92639006991e576
(magnetocorp admin)$ peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name papercontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
```
`peer lifecycle chaincode approveformyorg` 명령어를 통해 체인코드 정의를 승인한다.

채널 멤버가 체인코드 정의를 사용하는데 동의를 얻기 위해 필요한 체인코드 파라미터에서 가장 중요한 것 중 하나인 것은
체인코드 endorsement policy 이다. endorsement policy 는 유효한 것으로 판단되기 전에 거래를 승인(실행 및 서명)해야하는 조직 집합을 설명한다.
--policy flag없이 papercontract를 승인함으로써, MagnetoCorp 관리자는 채널의 기본 보증 정책을 사용하는 것이 동의한다. mycahnnel test channel의 경우
채널에 있는 대부분의 조직에서 거래를 승인해야 한다. 유효든 무효든 모든 트랜잭션는 원장 블록체인에 기록되지만,
유효된 거래만이 World state를 업데이트 한다.

7) Install and approve the smart contract as DigiBank

mychannel LifecycleEndorsement 정책에 기반해서, Fabric Chaincode lifecycle 은 체인코드가 channel에서 commit 되기 전에
체인코드 정의가 동의하라고 채널의 대다수의 조직에게 요청할 것이다.
이것은 papernet 체인코드가 승인되기 위해 MagnetoCorp와 DigiBank 2/2 승인이 필요함을 암시한다.
새 터미널을 열어 fabric-samples 에서 DigiBank 스마트 컨트랙트와 어플리케이션 파일이 포함된 폴더로 이동한다.

```shell script
(digibank admin) $ cd commercial-paper/organization/digibank/
exec bash
source digibank.sh
exec zsh
(digibank admin) $ peer lifecycle chaincode package cp.tar.gz --lang node --path ./contract --label cp_0
(digibank admin) $ peer lifecycle chaincode install cp.tar.gz
(digibank admin) $ peer lifecycle chaincode queryinstalled
export PACKAGE_ID=cp_0:61b9d0e7ee57237ed0dfa8e4f6a7bd574d21aa75feb435e152c7ae1122072c7c
(digibank admin) $ peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name papercontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
```
DigiBank 폴더에서 스크립트를 사용해 DigiBank 관리자로 행동할 수 있게 하는 환경 변수를 설정한다.
이제 DigiBank로서 papercontract를 설치하고 승인할 수 있다.
순서대로 체인코드를 패키지화하고, peer에 설치한다. packageID 를 query 후 환경변수로 저장한다.
마지막으로 승인한다.

8) Commit the chaincode definition to the channel

이제 DigiBank와 MagnetoCorp 둘 다 papernet 체인코드를 승인했다. 우리는 우리가 필요한 대다수를 가졌기에
채널에 체인코드 정의를 배포할 수 있다.
일단 체인코드가 성공적으로 채널에 정의되면, papercontract 체인코드 안 CommercialPaper 스마트 컨트랙트는
채널의 클라이언트 어플리케이션에 의해 호출될 수 있다.
어느 조직이든 채널에 체인코드를 commit할 수 있기에, 우리는 Digibank 관리자로 계속 운영한다.

DigiBank 관리자가 채널에 papercontract 체인코드 정의를 커밋한 이후에, 두 Paper peer에서 papercontract 를 실행하기 위한 새 Docker 체인코드 컨테이너가 만들어진다.
DigiBank 관리자가 peer lifecycle chaincode commit 을 사용해서 mychannel에 papercontract 체인코드 정의를 commit 한다.

```shell script
(digibank admin)$ peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --peerAddresses localhost:7051 --tlsRootCertFiles ${PEER0_ORG1_CA} --peerAddresses localhost:9051 --tlsRootCertFiles ${PEER0_ORG2_CA} --channelID mychannel --name papercontract -v 0 --sequence 1 --tls --cafile $ORDERER_CA --waitForEvent
> KST [chaincodeCmd] ClientWait -> INFO 001 txid [b68c6e0a5b9cc8159eb73b486e57960095d8cc8345d37232274264944a07e05c] committed with status (VALID) at localhost:9051
> KST [chaincodeCmd] ClientWait -> INFO 002 txid [b68c6e0a5b9cc8159eb73b486e57960095d8cc8345d37232274264944a07e05c] committed with status (VALID) at localhost:7051
```
체인코드 컨테이너가 채널에 commit된 이후 시작된다. 두 피어에게 papercontract container 가 생성되고, 컨테이너는 시작한 peer 이름을 지칭한다.
그리고 papercontract version 0으로 실행된다.

이제 MagnetoCorp 어플리케이션으로 상업 용지를 발행해본다.

9) Application structure

papercontract 에 포함된 MagnetoCorp의 어플리케이션에서는 issue.js로 불린다. 
Isabella는 상업 용지 00001을 발행하기 위한 원장으로의 트랜잭션 제출을 어플리케이션을 사용해 한다.

1. 일단 wallet에서 issue application 으로 retrieve
2. gateway로 summit
3. MagnetoCorp peer1으로 propose/endorse
4. Orderer로 order
5. Orderer가 MangeotoCorp peer1으로 distribute
6. MagnetoCorp peer1 에서 gateway로 notify
7. gateway에서 issue application으로 response

gateway는 어플리케이션이 트랜잭션 생성, 제출, 응답에만 집중하게 한다. 그것은 서로 다른 네트워크 구성요소들 간의 거래 제안, 주문 및 통지 처리를 조정한다.

issue application 이 Isabella의 행동을 트랜잭션으로 제출하기 때문에, 그것은 Isabella의 X.509 인증서를 그녀의 wallet에서 검색함으로써 시작한다.
이 인증서는 로컬 file system이나 Hardware Security Module (HSM) 에 저장될 것이다.
issue application 은 이후 채널에 트랜잭션을 제출하기 위한 gateway 활성화가 가능하다.
Fabric SDK는 gateway 추상화를 제공해서 네트워크 상호작용을 게이트웨이에게 위임하는 동안 어플리케이션이 어플리케이션 로직에만 집중하게 한다.
Gateways 와 wallets 는 패브릭 어플리케이션을 간단하게 쓸 수 있게 한다.

Isabella 가 사용할 issue application을 보자
```shell script
 cd fabric-samples/commercial-paper/organization/magnetocorp/application/
ls
> addToWallet.js      enrollUser.js       issue.js        package.json
```
addToWallet.js 는 Isabella 가 그녀의 wallet에 그녀의 identity를 넣는 프로그램이다.
issue.js는 이 identity를 이용해 새 상업 용지 00001 을 papercontract를 호출함으로써 MagnetoCorp의 행동으로 생성하는것이다.

issue.js 의 구성요소를 살펴보면,
- `const { Wallets, Gateway } = require('fabric-network');`

SDK 클래스를 가져온다 - Wallet, Gateway

- `const wallet = await Wallets.newFileSystemWallet('../identity/user/isabella/wallet');`

블록체인 네트워크 채널과 연결할 때 어플리케이션이 isabella wallet 을 사용할 것이라는 명시이다.
Isabella의 X.509 인증서가 local file system 이기 때문에, 애플리케이션은 새 FileSystemWallet을 생성한다.
어플리케이션은 isabella wallet안에 특정 identity를 선택한다.

- `await gateway.connect(connectionProfile, connectionOptions);`

ConnetctionOptions 안에 언급된 identity와 connectionProfile에 의해 인증된 게이트웨이를 사용해 네트워크에 연결한다.
`../gateway/networkConnection.yaml` 과 `User1@Org1.example.com` 이 각각 값들로 어떻게 사용되는 지 볼 수 있다.

- `const network = await gateway.getNetwork('mychannel');`

어플리케이션을 papercontract가 배포된 mychannel 네트워크 채널에 연결한다.

- `const contract = await network.getContract('papercontract');`

어플리케이션에게 papercontract 체인코드에 접근할 수 있게 한다. 일단 어플리케이션이
getContract 를 발행하면, 그것은 체인코드안에서 실행되는 어떤 스마트 컨트랙트 트랜잭션이던 다 제출할 수 있다.

- `const issueResponse = await contract.submitTransaction('issue', 'MagnetoCorp', '00001', ...);`

스마트 컨트랙트 안에 정의된 issue transaction 을 이용해 네트워크에 트랜잭션을 제출한다.
MagnetoCorp, 00001 은 인자 값

- `let paper = CommercialPaper.fromBuffer(issueResponse);`

issue transaction으로부터의 응답을 처리한다. 이 응답은 어플리케이션에 의해 표현되는 CommercialPaper 객체, paper로 buffer를 디코딩한것이다.

10) Application dependencies

issue.js 는 javascript로 작성되고 PaperNet 네트워크의 클라이언트로 node.js 환경으로 실행된다.
MagnetoCorp's application 은 외부 node packages 로 이루어져있다. (개발 속도와 질 향상 위해)
issue.js 가 YAML gateway connection profile을 처리하기 위해 js-yaml package를 포함했고,
Gateway와 Wallet 에 접근하기 위해 fabric-netwrok 패키지를 포함했음을 고려하라.

```javascript
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
```
이 패키지들은 npm install 을 통해 다운로드 받고, node_modules 에 설치된다.
```shell script
npm install
```

11) Wallet

Isabella는 MagnetoCorp 상업 용지 00001을 발행하기 위해 issue.js 를 실행할 준비가 거의 다 되었따.
하나 남은 것은 issue.js 가 Isabella, MagnetoCorp 의 행동으로 실행되게 하기 위해, 이 사실을 반영하는 지갑에서 신원을 찾을 것이다.
우리는 그녀의 wallet에 적절한 X.509 자격 증명을 생성하는 일회성 행동을 수행할 필요가 있다.

PaperNet 위에서 돌아가는 MagnetoCorp CA, ca_org2, 는 네트워크가 배포될 때 등록된 어플리케이션 유저를 가진다.
Isabella 는 이 identity 이름과 secret 을 가지고 issue.js 어플리케이션을 위한 X.509 암호 자료를 생성할 수 있다.
이 과정은 CA를 활용해 클라이언트 사이드의 암호 자료를 생성하는 것으로 enrollment로 언급된다.
실제 시나리오에서는, 네트워크 작동자가 CA에 등록된 클라이언트 identity의 이름과 secret 을 어플리케이션 developer에게 제공한다.
developer는 이 credential을 사용해 어플리케이션을 등록하고 네트워크와 상호작용한다.

enrollUser.js 프로그램은 fabric-ca-client 클래스를 사용해 개인, 공개키 쌍을 생성하고, CA에 Certificate Signing Request를 발행한다.
만약 Isabella에 의해 제출된 identity name과 secret이 CA에 등록된 것과 맞으면, CA는 공개키를 인코딩하는 인증서를 발급하고 서명함으로써 MagnetoCorp에 Isabella가 속했음을 확인한다.

서명 요청이 완료되면, enrollUser.js 는 개인키와 서명된 인증서를 Isabella의 wallet에 보관한다.
enrollUser.js 파일을 검사할 수 있고, Node SDK 가 fabric-ca-client 클래스를 활용하는지 볼 수 있다.

```shell script
Wallet path: Wallet path: /home/beomseok/fabric-samples/commercial-paper/organization/magnetocorp/identity/user/isabella/wallet
Successfully enrolled client user "isabella" and imported it into the walletnode enrollUser.js

ls ../identity/user/isabella/wallet/
isabella.id
```
PaperNet에 트랜잭션을 제출할 때 사용될 wallet contents 보여준다.

Isabella는 그녀의 wallet에 여러 신분을 보관할 수 있지만, 이 예제에서는 하나만 이용한다.
wallet 폴더는 isabella.id 파일을 포함하고 이 파일은 isabella 가 네트워크에 연결하기 위한 정보를 제공한다.
Isabella에 의해 사용되는 다른 identities들은 그들 자신의 파일을 갖는다.
issue.js 가 JSON 파일 내에서 Isabella 대신해 사용할 ID 정보를 볼 수 있다.

```shell script
(isabella)$  cat ../identity/user/isabella/wallet/*

{
  "credentials": {
    "certificate": "-----BEGIN CERTIFICATE-----\nMIICKTCCAdCgAwIBAgIQWKwvLG+sqeO3LwwQK6avZDAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMi5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMi5leGFtcGxlLmNvbTAeFw0yMDAyMDQxOTA5MDBaFw0zMDAyMDExOTA5MDBa\nMGwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMQ8wDQYDVQQLEwZjbGllbnQxHzAdBgNVBAMMFlVzZXIxQG9y\nZzIuZXhhbXBsZS5jb20wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAT4TnTblx0k\ngfqX+NN7F76Me33VTq3K2NUWZRreoJzq6bAuvdDR+iFvVPKXbdORnVvRSATcXsYl\nt20yU7n/53dbo00wSzAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADArBgNV\nHSMEJDAigCDOCdm4irsZFU3D6Hak4+84QRg1N43iwg8w1V6DRhgLyDAKBggqhkjO\nPQQDAgNHADBEAiBhzKix1KJcbUy9ey5ulWHRUMbqdVCNHe/mRtUdaJagIgIgYpbZ\nXf0CSiTXIWOJIsswN4Jp+ZxkJfFVmXndqKqz+VM=\n-----END CERTIFICATE-----\n",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQggs55vQg2oXi8gNi8\nNidE8Fy5zenohArDq3FGJD8cKU2hRANCAAT4TnTblx0kgfqX+NN7F76Me33VTq3K\n2NUWZRreoJzq6bAuvdDR+iFvVPKXbdORnVvRSATcXsYlt20yU7n/53db\n-----END PRIVATE KEY-----\n"
  },
  "mspId": "Org2MSP",
  "type": "X.509",
  "version": 1
}
```
privateKey는 Isabella를 대신해 거래에 sign 하기 위해 이용된다. 그녀의 즉각적인 통제 밖에서 분배되지는 않음.
certificate: 인증서 생성 시 인증 기관에서 추가한 Isabella의 공개 키 및 기타 X.509 속성을 포함하는 인증서. 이 인증서는 서로 다른 시기에 서로 다른 행위자들이
Isabella의 개인키가 만든 정보를 암호화된 방식으로 검증할 수 있도록 네트워크에 배포된다.

인증서 파일은 Isabella의 조직과 역할에 대한 metadata도 포함한다.

11) Issue application

Isabella는 issue.js 를 통해 MagnetoCorp 상업용지 00001 을 발행하는 트랜잭션을 제출할 수 있다.
```shell script
(isabella)$ node issue.js

Connect to Fabric gateway.
Use network channel: mychannel.
Use org.papernet.commercialpaper smart contract.
Submit commercial paper issue transaction.
Process issue transaction response.{"class":"org.papernet.commercialpaper","key":"\"MagnetoCorp\":\"00001\"","currentState":1,"issuer":"MagnetoCorp","paperNumber":"00001","issueDateTime":"2020-05-31","maturityDateTime":"2020-11-30","faceValue":"5000000","owner":"MagnetoCorp"}
MagnetoCorp commercial paper : 00001 successfully issued for value 5000000
Transaction complete.
Disconnect from Fabric gateway.
Issue program complete.
```
MagnetoCorp 상업용지 00001 이 액면가 5M USD로 발행되었음을 알 수 있다.

어플리케이셔션은 papercontract.js 안 CommercialPaper 스마트 컨트랙트에 정의된 issue 트랜잭션을 호출한다.
스마트 컨트랙트는 Fabric API를 통해 원장과 상호작용하고, 주로 putState() 와 getState(), world state 안에 새 상업 용지를 vector state로 표현하기 위해.
벡터 상태가 스마트 계약 내에서 정의된 매입 및 상환 거래에 의해 이후에 어떻게 조작되는지 확인할 것이다.

항상 기본 Fabric SDK는 트랜잭션 승인, 주문 및 알림 프로세스를 처리하여 
애플리케이션의 로직을 단순화하며, SDK는 게이트웨이를 사용하여 네트워크 세부 정보와 연결을 추상화하며, 
옵션을 사용하여 트랜잭션 재시도 같은 고급 처리 전략을 선언한다.

이제 DigiCorp 00001의 라이프사이클을 따라 DigiBank, Balaji의 직원에게 초점을 전환하여 DigiBank 애플리케이션을 사용하여 상업용지를 구입하도록 한다.

12) Digibank application

Balaji 는 DigiBank 의 buy 어플리케이션을 이용해 MagnetoCorp 로부터 DigiBank로 상업용지 00001의 주인을 변경하는 트랜잭션을 원장에 제출한다.
CommercialPaper 스마트 컨트랙트는 MagnetoCorp의 어플리케이션에서 사용하는 것과 같지만, 트랜잭션은 다르다. issue 가 아니라 buy이다.

```shell script
(balaji)$ cd commercial-paper/organization/digibank/application/
```
buy.js 어플리케이션은 MagnetoCorp의 issue.js 와 두가지 다른 점을 포함해 비슷한 구조를 가진다.

Identity: user는 MagnetoCorp's Isabella가 아닌 DigiBank user인 Balaji 이다.
- `const wallet = await Wallets.newFileSystemWallet('../identity/user/balaji/wallet');`

어플리케이션에 Papernet 네트워크 채널에 연결핼 때 balaji wallet을 어떻게 사용하는지 볼 수 있다.

Transaction: issue가 아니라 buy 트랜잭션을 호출한다.
- `const buyResponse = await contract.submitTransaction('buy', 'MagnetoCorp', '00001', ...);`

buy 트랜잭션은 MagneotoCorp, 00001 이라는 값과 함께 상업용지 00001을 DigiBank 것으로 만드는 CommercialPaper 스마트 컨트랙트 클래스에 제출된다.

13) Run as DigiBank

DigiBank 어플리케이션은 살 수 있고 되 팔 수 있다. MagnetoCorp의 issue 어플리케이션과 비슷한 구조를 가진다. 그래서, npm install 로 깔고,
Balaji의 wallet을 설정해 어플리케이션이 상업 용지를 사고 되팔 수 있게 한다.
```shell script
(digibank admin)$ cd commercial-paper/organization/digibank/application/
(digibank admin)$ npm install

(balaji)$ node enrollUser.js
```
enrollUser 프로그램은 그녀의 인증서와 개인키를 생성해 wallet에 집어넣음
addToWallet.js 프로그램은 PaperNet에 트랜잭션을 제출하기 위해 사용될 buy.js, redeem.js에서 사용되는 
balaji의 identity 정보를 그녀의 wallet으로 집어 넣는다.

14) Buy application

Balaji는 buy.js 를 사용해 트랜잭션 제출한다.
```shell script
(balaji)$ node buy.js

Connect to Fabric gateway.
Use network channel: mychannel.
Use org.papernet.commercialpaper smart contract.
Submit commercial paper buy transaction.
Process buy transaction response.
MagnetoCorp commercial paper : 00001 successfully purchased by DigiBank
Transaction complete.
Disconnect from Fabric gateway.
Buy program complete.
```

15) Redeem application

Balaji 가 redeem.js 를 사용해 트랜잭션 제출한다.

```shell script
(balaji)$ node redeem.js

Connect to Fabric gateway.
Use network channel: mychannel.
Use org.papernet.commercialpaper smart contract.
Submit commercial paper redeem transaction.
Process redeem transaction response.
MagnetoCorp commercial paper : 00001 successfully redeemed with MagnetoCorp
Transaction complete.
Disconnect from Fabric gateway.
Redeem program complete.
```

16) Clean up

```shell script
cd fabric-samples/commercial-paper
./network-clean.sh
```