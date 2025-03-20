import "./index.scss";

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
            <button>Edit profile</button>
            <button>View archive</button>
            <button>Settings</button>
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
            <img src="https://via.placeholder.com/80" alt="Story" />
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
            <img src="https://via.placeholder.com/300" alt="Post" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
