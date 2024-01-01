import { _decorator, AudioClip, AudioSource, Component, loader, Node } from 'cc';

export class AudioManager {

    public static playMusic(name: string): void {
        const path = `audio/music/${name}`;
        loader.loadRes(path, AudioClip, (error, clip) => {
            if (error) {
                console.warn(`AudioManager playMusic Error: ${error}`);
                return;
            }
            clip.setLoop(true);
            clip.play();
        });
    }

    public static playSound(name: string): void {
        const path = `audio/sound/${name}`;
        loader.loadRes(path, AudioClip, (error, clip) => {
            if (error) {
                console.warn(`AudioManager playSound Error: ${error}`);
                return;
            }
            clip.setLoop(false);
            clip.playOneShot(1);
        });
    }
}

