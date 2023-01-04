import unittest
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time


from selenium.webdriver.support import expected_conditions as EC


class PythonOrgSearch(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome('./chromedriver')

    def test_search_in_talentland_login(self):
        driver = self.driver
        time.sleep(2)

        driver.get("https://talentland1.herokuapp.com/login")
        self.assertIn("TALENT LAND", driver.title)
        email = driver.find_element(By.NAME, "email")
        password = driver.find_element(By.NAME, "password")
        email.send_keys("beyza@beyza")
        time.sleep(1)
        password.send_keys("bbb")
        time.sleep(1)
        password.send_keys(Keys.RETURN)


        elem = driver.find_element(By.ID,"username_field")

        elem.send_keys("pınar")
        time.sleep(0.6)
        time.sleep(2)
        self.assertIn("username", driver.page_source)


    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()


   