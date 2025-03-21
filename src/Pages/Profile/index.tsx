import { Button } from "antd";
import "./index.scss";
import { SettingOutlined } from "@ant-design/icons";

function Profile() {
  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__avatar">
          <img
            src="https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/480269034_1366708034502411_8861701056649694706_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=107&ccb=1-7&_nc_sid=fe5ecc&_nc_eui2=AeEXyv99t2XvQjhe2a3rNgK6jUMunQ6LApCNQy6dDosCkO1Ge85I8bRba1XHVonlMgeQxj7Dt0K5_i-RIRqEPwC-&_nc_ohc=b8jHLrb8ufMQ7kNvgE2lWFA&_nc_oc=AdnK6SeapKw90TDWQUNsjbmFhF5gJQvNkIxX-K8kgVRlZ3CZnKzcR3OD_jxS0BcAw-I&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=U6IiXeEvJ0t9CBBwu-CQVg&oh=00_AYEzxdN95fQafwDmv8B4z7FagedUzaOJH2iM8T7pAr2KRQ&oe=67E21664"
            alt="Profile Avatar"
          />
        </div>
        <div className="profile__info">
          <div className="profile__username">
            <h2>chuong_191</h2>
            <Button>Edit profile</Button>
            <Button>View archive</Button>
            {/* <Button> */}
            <SettingOutlined />
            {/* </Button> */}
          </div>
          <div className="profile__stats">
            <span>1 post</span>
            <span>23 followers</span>
            <span>1 following</span>
          </div>
          <div className="profile__name">
            <h3>Lê Văn Chương</h3>
            <p>@chuong_191</p>
          </div>
        </div>
      </div>
      <div className="profile__content">
        <div className="profile__stories">
          <div className="profile__story">
            <img
              src="https://scontent.fsgn5-5.fna.fbcdn.net/v/t39.30808-6/479904496_1366714647835083_3637611312555656878_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEblLcXxqgdL1JASyjR_JAWC7dUwBIkft4Lt1TAEiR-3rp_qXelKWh_s53LQLAyT-6XahIH431-Wep-iez7jWLv&_nc_ohc=VKuCU1paZQQQ7kNvgFaqOa4&_nc_oc=Adl98SxVC0FodtyX9P1-FwtJVzxcNw1MbAFENZFG8Gc20m4XyCDiVYIj-HMyf7RF-jU&_nc_zt=23&_nc_ht=scontent.fsgn5-5.fna&_nc_gid=taQ4F4N7PTSfRn-E6xYnCw&oh=00_AYFQ_vvjtpxlBmPw8pGOzvbWtOjCe6R-rKgVLKechaZvAQ&oe=67E2ECAC"
              alt="Story"
            />
            <span>Story 1</span>
          </div>
          <div className="profile__story">
            <img src="https://via.placeholder.com/80" alt="Story" />
            <span>New</span>
          </div>
        </div>
        <div className="profile__posts">
          <div className="profile__tabs">
            <span>POSTS</span>
            <span>SAVED</span>
            <span>TAGGED</span>
          </div>
          <div className="profile__post">
            <img
              src="https://www.instagram.com/_3blackrose_/p/C5Ys0dnyKYbkcGgsyh9F1tTUMKTAiXmerfp8yQ0/"
              alt="Post"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
