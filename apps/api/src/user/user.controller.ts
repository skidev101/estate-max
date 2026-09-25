import { Controller, Get, Param, Query, ParseIntPipe, Post, Body } from "@nestjs/common";

@Controller("user")
export class UserController {
  private users = [
    { id: 1, name: "ski" },
    { id: 2, name: "john doe" },
  ];

  @Get()
  getUsers(@Query("name") name: string) {
    if (name) {
      return this.users.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()));
    }

    return this.users;
  }

  @Get(":id")
  getUserById(@Param("id", ParseIntPipe) id: number) {
    return this.users.find((user) => user.id === id)
  }

  @Post() 
  createUser(@Body() body:any) {
    return { message: "user created successfully"}
  }
}
