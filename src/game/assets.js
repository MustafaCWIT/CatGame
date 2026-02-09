import logoImg from '../assets/logo.png';
import catImg from '../assets/cat.png';
import nameImg from '../assets/name.png';
import fishImg from '../assets/fish.png';
import bowlImg from '../assets/bowl.png';
import gameCloudImg from '../assets/gameCloud.png';
import backgroundImg from '../assets/background.png';
import gameBackgroundImg from '../assets/gameBackground.png';
import lyingCatImg from '../assets/lyingCat.png';
import starImg from '../assets/star.png';
import starsImg from '../assets/stars.png';
import leafImg from '../assets/leaf.png';
import sparrowImg from '../assets/sparrow.png';
import dollarImg from '../assets/dollar.png';
import gameImg from '../assets/game.png';
import catViewingImg from '../assets/catViewing.png';
import clearCloudsImg from '../assets/clearClouds.png';
import foodBoxImg from '../assets/foodBox.png';
import foodBoxesImg from '../assets/foodBoxes.png';
import signUpCloudImg from '../assets/signUpCloud.png';
import sleepCatImg from '../assets/sleepCat.png';
import blurCloudsImg from '../assets/clouds.png';
import gameScoreImg from '../assets/gameScore.png';
import gameTimeImg from '../assets/gameTime.png';

export const GAME_ASSETS = {
    logo: logoImg,
    cat: catImg,
    name: nameImg,
    fish: fishImg,
    bowl: bowlImg,
    gameCloud: gameCloudImg,
    background: backgroundImg,
    gameBackground: gameBackgroundImg,
    lyingCat: lyingCatImg,
    star: starImg,
    stars: starsImg,
    leaf: leafImg,
    sparrow: sparrowImg,
    dollar: dollarImg,
    game: gameImg,
    catViewing: catViewingImg,
    clearClouds: clearCloudsImg,
    foodBox: foodBoxImg,
    foodBoxes: foodBoxesImg,
    signUpCloud: signUpCloudImg,
    sleepCat: sleepCatImg,
    blurClouds: blurCloudsImg,
    gameScore: gameScoreImg,
    gameTime: gameTimeImg
};

export const ALL_ASSETS = Object.values(GAME_ASSETS);

export function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
