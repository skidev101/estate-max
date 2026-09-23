import { Controller } from "@nestjs/common";

@Controller("user")
export class UserController {
	@Get()
	getUsers() {
		return [
			{ id: 1, name: "ski" },
			{ id: 2, name: "dave" },
			{ id: 3, name: "john doe" },
		];
	}
}
