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
        email.send_keys("deneme1@gmail.com")
        time.sleep(1)
        password.send_keys("123")
        time.sleep(1)
        password.send_keys(Keys.RETURN)
        
        
        time.sleep(1)
        self.assertIn("username", driver.page_source)

        driver.find_element(By.LINK_TEXT, "Edit Profile").click()
        time.sleep(1)

        driver.find_element(By.LINK_TEXT, "Delete Account").click()

        self.assertIn("email", driver.page_source)
        time.sleep(3)


    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()