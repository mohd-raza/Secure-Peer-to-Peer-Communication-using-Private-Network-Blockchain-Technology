import Modal from "react-modal";
import Web3 from "web3";
import { abi } from "./abi";
import { useEffect, useState } from "react";

const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const RemixContract = new web3.eth.Contract(
  abi,
  "0x944D2DeAbE09F1FE42e9f7eFA9Caf0f49488a28B"
);

function App() {
  const [user, setUser] = useState(false);
  const [account, setAccount] = useState(null);
  const [username, setUsername] = useState(null);
  const [friends, setFriends] = useState([]);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [message, setMessage] = useState("");
  const [friendModal, setFriendModal] = useState(false);
  const [friend, setFriend] = useState({
    address: "",
    name: "",
  });
  const [userModal, setUserModal] = useState(false);
  const [name, setName] = useState('')

  useEffect(() => {
    let account = null;
    (async () => {
      const accounts = await window.ethereum.enable();
      console.log(accounts);
      account = accounts[0];
      setAccount(account);
      checkUserExists(account);
    })();
  }, []);

  useEffect(() => {
    if (user) {
      getUsername(account);
      getFriends();
    }
  }, [user]);

  useEffect(() => {
    if (chat) {
      getMessages(chat[0]);
    }
  }, [chat]);

  const sendMessage = () => {
    if (message) {
      sendMsg(chat[0], message);
      setMessage("");
    }
  };

  const add = () => {
    if (friend.address && friend.name) {
      addFriend();
      setFriendModal(false);
      setFriend({
        address: "",
        name: "",
      });
    }
  }

  const create = () => {
    if (name) {
      createUser();
      setUserModal(false);
      setName('')
    }
  }

  const checkUserExists = async (address) => {
    const gas = await RemixContract.methods
      .checkUserExists(address)
      .estimateGas();
    const result = await RemixContract.methods
      .checkUserExists(address)
      .call({ from: account, gas })
      .then((res) => (res ? setUser(true) : setUser(false)));
  };

  const getUsername = async (address) => {
    const gas = await RemixContract.methods.getUsername(address).estimateGas();
    const result = await RemixContract.methods
      .getUsername(address)
      .call({ from: account, gas })
      .then((res) => setUsername(res));
  };

  const getFriends = async () => {
    const result = await RemixContract.methods
      .getMyFriendList()
      .call({ from: account })
      .then((res) => setFriends(res));
  };

  const getMessages = async (address) => {
    const result = await RemixContract.methods
      .readMessage(address)
      .call({ from: account })
      .then((res) => setMessages(res));
  };

  const sendMsg = async (to, msg) => {
    // const gas = await RemixContract.methods.sendMessage(to, msg).estimateGas();
    const result = await RemixContract.methods
      .sendMessage(to, msg)
      .send({ from: account })
      .then(console.log);
  };

  const addFriend = async () => {
    // const gas = await RemixContract.methods
    //   .addFriend(friend.address, friend.name)
    //   .estimateGas();
    const result = await RemixContract.methods
      .addFriend(friend.address, friend.name)
      .send({ from: account })
      .then(console.log);
  };

  const createUser = async () => {
    const gas = await RemixContract.methods
      .createAccount(name)
      .estimateGas();
    const result = await RemixContract.methods
      .createAccount(name)
      .send({ from: account })
      .then(console.log);
  };

  return (
    <div className="h-screen">
      <div className="w-screen h-[10vh] px-12 py-3 flex justify-between items-center border-b">
        <h1 className="text-xl font-semibold">DecenTalk</h1>
        {user ? (
          <h1 className="text-xl font-semibold">{username}</h1>
        ) : (
          <button
            onClick={() => setUserModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-300"
          >
            Create Account
          </button>
        )}
      </div>
      {user ? (
        <div className="grid grid-cols-12 h-[90vh]">
          <div className="col-span-3 border-r flex flex-col px-12 py-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold">Friends</h1>
              <button
                onClick={() => setFriendModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-300"
              >
                Add Friends
              </button>
            </div>
            <div className="flex justify-center items-center">
              <input
                type="text"
                placeholder="Search"
                className="px-4 py-2 rounded-xl border border-gray-300 w-full"
              />
            </div>
            <div className="flex flex-col mt-4">
              {friends.map((friend) => (
                <div
                  onClick={() => setChat(friend)}
                  key={friend[0]}
                  className="flex cursor-pointer justify-between items-center py-2 border-b"
                >
                  <h1 className="text-xl font-semibold">{friend[1]}</h1>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-9">
            {chat ? (
              <div className="h-[90vh]">
                <div className="h-[80vh]">
                  <div className="h-[8vh] px-12 flex items-center border-b">
                    <h1 className="text-xl font-semibold">{chat[1]}</h1>
                  </div>
                  <div className="h-[72vh] overflow-y-scroll py-2">
                    {messages?.map((msg, index) => (
                      <div key={index} className="flex flex-col px-12 py-2">
                        {msg[0].toLowerCase() === account ? (
                          <div className="flex justify-end w-full">
                            <div className="rounded-xl px-3 py-2 bg-blue-300">
                              <h1 className="">{msg[2]}</h1>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-start w-full">
                            <div className="rounded-xl px-3 py-2 bg-gray-300">
                              <h1 className="">{msg[2]}</h1>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-[10vh] px-12 border-t flex justify-center items-center">
                  <input
                    type="text"
                    placeholder="type a message"
                    className="border rounded-xl px-4 py-2 w-full"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    onClick={() => sendMessage()}
                    className="px-4 py-2 rounded-xl bg-blue-300 ml-4"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-[90vh] flex justify-center items-center">
                <h1 className="text-xl font-semibold">
                  Select friend to start conversation.
                </h1>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-[90vh] justify-center items-center"> 
          <div className="w-1/2 h-1/2 flex flex-col justify-center items-center">
            <h1 className="text-4xl font-semibold mb-12">Welcome to DecenTalk</h1>
            <button
              onClick={() => setUserModal(true)}
              className="px-4 py-2 rounded bg-blue-300"
            >
              Create Account
            </button>
          </div>
        </div>
      )}
      <Modal
        isOpen={friendModal}
        onRequestClose={() => setFriendModal(false)}
        className="w-[50vw] h-[50vh] mx-auto mt-[25vh] bg-gray-100 rounded-xl"
      >
        <div className="w-full h-full flex flex-col p-12 gap-8">
          <h1 className="text-2xl font-semibold mb-2">Add Friends</h1>
          <input
            type="text"
            placeholder="Enter Address"
            className="px-4 py-2 rounded-xl border border-gray-300 w-full"
            value={friend.address}
            onChange={(e) => setFriend({ ...friend, address: e.target.value })}
          />
          <input
            type="text"
            placeholder="Enter Name"
            className="px-4 py-2 rounded-xl border border-gray-300 w-full"
            value={friend.name}
            onChange={(e) => setFriend({ ...friend, name: e.target.value })}
          />
          <button
            onClick={() => add()}
            className="px-4 py-2 rounded-xl bg-blue-300"
          >
            Add
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={userModal}
        onRequestClose={() => setUserModal(false)}
        className="w-[50vw] h-[50vh] mx-auto mt-[25vh] bg-gray-100 rounded-xl"
      >
        <div className="w-full h-full flex flex-col p-12 gap-8">
          <h1 className="text-2xl font-semibold mb-2">Create Account</h1>
          <input
            type="text"
            placeholder="Enter Name"
            className="px-4 py-2 rounded-xl border border-gray-300 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={() => create()}
            className="px-4 py-2 rounded-xl bg-blue-300"
          >
            Add
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
