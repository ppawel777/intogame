export type IUserData = {
   id: number
   uuid: string
   username: string
   first_name: string
   last_name: string
   email: string
   position: string
   telephone: string
}

export type SessionAuth = {
   access_token: string
   refresh_token: string
   user_id: string
}
