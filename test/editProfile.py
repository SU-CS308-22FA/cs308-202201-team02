import unittest
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time


class PythonOrgSearch(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome('./chromedriver')

    def test_search_in_talentland(self):
        driver = self.driver
        time.sleep(1)

        driver.get("https://talentland1.herokuapp.com/login")
        self.assertIn("TALENT LAND", driver.title)
        email = driver.find_element(By.NAME, "email")
        password = driver.find_element(By.NAME, "password")
        email.send_keys("beyza@beyza")
        time.sleep(1)
        password.send_keys("bbb")
        time.sleep(1)
        password.send_keys(Keys.RETURN)
        
        
        time.sleep(1)
        self.assertIn("username", driver.page_source)

        driver.find_element(By.LINK_TEXT, "Edit Profile").click()
        time.sleep(3)


        username= driver.find_element(By.NAME, "username")
        email = driver.find_element(By.NAME, "email")
        password = driver.find_element(By.NAME, "password")
        phone_number = driver.find_element(By.NAME, "phone")
        message = driver.find_element(By.NAME, "message")
        
        username.send_keys("eren")
        time.sleep(2)

        email.send_keys("changed@gmail")
        time.sleep(2)
        password.send_keys("1")
        time.sleep(2)

        phone_number.send_keys("5555")
        time.sleep(2)

        message.send_keys("hello")
        time.sleep(2)
        message.send_keys(Keys.RETURN)

        self.assertIn("username", driver.page_source)

    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()