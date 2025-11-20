package com.inform.orderms;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class OrderManagementBackendApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void helloWorldTest() {
		String greeting = "Hello World from Java 21!";
		assert greeting.contains("Java 21");
		System.out.println(greeting);
	}

}
