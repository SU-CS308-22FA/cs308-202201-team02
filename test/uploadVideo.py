import unittest
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time

from selenium.webdriver.support.select import Select

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
        
        
        self.assertIn("username", driver.page_source)

        camera= driver.find_element(By.CSS_SELECTOR, "i[class*='fa fa-video-camera']")
        camera.click()

        dataset_drop_down_element = WebDriverWait(self.driver, 20).until(EC.element_to_be_clickable((By.NAME, 'sections')))
        dataset_drop_down_element = Select(dataset_drop_down_element)

        title = driver.find_element(By.NAME, "video_title")
        title.send_keys("new title")
        time.sleep(1)
        title.send_keys(Keys.RETURN)


    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()