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

        driver.get("https://talentland1.herokuapp.com/")
        self.assertIn("TALENT LAND", driver.title)

        driver.find_element(By.LINK_TEXT, "Scout Request").click()
        
        name = driver.find_element(By.NAME, "sname")
        email = driver.find_element(By.NAME, "semail")
        message = driver.find_element(By.NAME, "smessage")
        name.send_keys("pınar")
        time.sleep(2)
        email.send_keys("pinar@a.com")
        time.sleep(2)
        message.send_keys("scout request from test")
        time.sleep(2)
        email.send_keys(Keys.RETURN)

    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()