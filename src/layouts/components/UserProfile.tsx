interface IUserPropfile {
   current_user: string
   userAlias: string
}

const UserProfile = ({ current_user, userAlias }: IUserPropfile) => {
   return (
      <div title={current_user} className="wrap-sidebar__profile-user">
         <span>{userAlias}</span>
         <p>{current_user}</p>
      </div>
   )
}

export default UserProfile
